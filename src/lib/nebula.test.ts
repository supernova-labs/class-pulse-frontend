import { computeNebulaLayout, MAX_STARS } from "./nebula";

const question = (id: string, votes: number, status = "open") => ({
  id,
  votes,
  status,
  created_at: `2026-07-11T10:00:0${id.length % 10}Z`,
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
    const layout = computeNebulaLayout([
      question("open", 5),
      question("done", 9, "answered"),
    ]);
    const done = layout.stars.find((star) => star.id === "done");
    expect(done?.isLeaving).toBe(true);
    expect([3, 97]).toContain(done?.x);
    expect(done!.brightness).toBeLessThan(0.2);
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
