import { computeNebulaLayout, MAX_STARS } from "./nebula";

const question = (
  id: string,
  votes: number,
  status: "open" | "answered" = "open",
  answeredAt: string | null = null,
) => ({
  id,
  votes,
  status,
  created_at: `2026-07-11T10:00:0${id.length % 10}Z`,
  answered_at: answeredAt ?? (status === "answered" ? "2026-07-11T11:00:00Z" : null),
});

describe("computeNebulaLayout", () => {
  it("gives the center slot to the most voted open question", () => {
    const layout = computeNebulaLayout([
      question("low", 2),
      question("top", 10),
      question("mid", 5),
    ]);
    const center = layout.stars.find((star) => star.isCenter);
    expect(center?.id).toBe("top");
    expect(center?.x).toBe(50);
  });

  it("caps stars at MAX_STARS and reports overflow", () => {
    const questions = Array.from({ length: 14 }, (_, i) => question(`q${i}`, i));
    const layout = computeNebulaLayout(questions);
    expect(layout.stars.filter((star) => !star.isLeaving)).toHaveLength(MAX_STARS);
    expect(layout.overflow).toBe(14 - MAX_STARS);
  });

  it("assigns distinct slots to every visible star", () => {
    const questions = Array.from({ length: 9 }, (_, i) => question(`q${i}`, i));
    const layout = computeNebulaLayout(questions);
    const slots = new Set(layout.stars.map((star) => `${star.x},${star.y}`));
    expect(slots.size).toBe(layout.stars.length);
  });

  it("scales size and brightness monotonically with votes", () => {
    const layout = computeNebulaLayout([question("big", 20), question("small", 1)]);
    const big = layout.stars.find((star) => star.id === "big");
    const small = layout.stars.find((star) => star.id === "small");
    expect(big!.scale).toBeGreaterThan(small!.scale);
    expect(big!.brightness).toBeGreaterThan(small!.brightness);
  });

  it("parks answered questions dimmed at a horizontal edge", () => {
    const layout = computeNebulaLayout([question("open", 5), question("done", 9, "answered")]);
    const done = layout.stars.find((star) => star.id === "done");
    expect(done?.isLeaving).toBe(true);
    expect([3, 97]).toContain(done?.x);
    expect(done!.brightness).toBeLessThan(0.2);
  });

  it("parks the most recently answered questions, not the most voted", () => {
    const questions = [
      question("open", 1),
      question("old-popular-1", 90, "answered", "2026-07-11T11:00:01Z"),
      question("old-popular-2", 80, "answered", "2026-07-11T11:00:02Z"),
      question("old-popular-3", 70, "answered", "2026-07-11T11:00:03Z"),
      question("old-popular-4", 60, "answered", "2026-07-11T11:00:04Z"),
      question("fresh", 1, "answered", "2026-07-11T12:00:00Z"),
    ];
    const layout = computeNebulaLayout(questions);
    const parked = layout.stars.filter((star) => star.isLeaving).map((star) => star.id);
    expect(parked).toContain("fresh");
    expect(parked).not.toContain("old-popular-1");
  });

  it("clamps maxStars to the available slots", () => {
    const questions = Array.from({ length: 30 }, (_, i) => question(`q${i}`, i));
    const layout = computeNebulaLayout(questions, 20);
    const visible = layout.stars.filter((star) => !star.isLeaving);
    expect(visible).toHaveLength(MAX_STARS);
    expect(layout.overflow).toBe(30 - MAX_STARS);
  });

  it("keeps at most 4 answered stars", () => {
    const questions = [
      question("open", 1),
      ...Array.from({ length: 6 }, (_, i) => question(`a${i}`, i, "answered")),
    ];
    const layout = computeNebulaLayout(questions);
    expect(layout.stars.filter((star) => star.isLeaving)).toHaveLength(4);
  });
});
