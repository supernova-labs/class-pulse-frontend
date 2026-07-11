import { sortQuestions } from "./sortQuestions";

const question = (id: string, votes: number, status = "open", createdAt = "2026-07-11T10:00:00Z") => ({
  id,
  votes,
  status,
  created_at: createdAt,
});

describe("sortQuestions", () => {
  it("orders by votes descending", () => {
    const sorted = sortQuestions([question("a", 1), question("b", 5), question("c", 3)]);
    expect(sorted.map((q) => q.id)).toEqual(["b", "c", "a"]);
  });

  it("breaks vote ties by created_at ascending", () => {
    const sorted = sortQuestions([
      question("late", 2, "open", "2026-07-11T11:00:00Z"),
      question("early", 2, "open", "2026-07-11T10:00:00Z"),
    ]);
    expect(sorted.map((q) => q.id)).toEqual(["early", "late"]);
  });

  it("puts answered questions last regardless of votes", () => {
    const sorted = sortQuestions([
      question("answered", 99, "answered"),
      question("open", 1),
    ]);
    expect(sorted.map((q) => q.id)).toEqual(["open", "answered"]);
  });

  it("does not mutate the input", () => {
    const input = [question("a", 1), question("b", 5)];
    sortQuestions(input);
    expect(input.map((q) => q.id)).toEqual(["a", "b"]);
  });
});
