import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Question } from "../../api/types";
import { QuestionRow } from "./QuestionRow";

const question = (overrides: Partial<Question> = {}): Question => ({
  id: "q1",
  body: "Uma pergunta?",
  status: "open",
  votes: 3,
  voted_by_me: false,
  author_name: "Guest 01",
  answered_at: null,
  created_at: "2026-07-11T10:00:00Z",
  ...overrides,
});

describe("QuestionRow", () => {
  it("renders body, author and votes with an enabled vote button", async () => {
    const onToggleVote = jest.fn();
    render(
      <ul>
        <QuestionRow question={question()} onToggleVote={onToggleVote} />
      </ul>,
    );
    expect(screen.getByText("Uma pergunta?")).toBeInTheDocument();
    expect(screen.getByText("Guest 01")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Votar" }));
    expect(onToggleVote).toHaveBeenCalledTimes(1);
  });

  it("shows answered questions dimmed, tagged and with voting disabled", () => {
    render(
      <ul>
        <QuestionRow question={question({ status: "answered", votes: 9 })} />
      </ul>,
    );
    expect(screen.getByText("RESPONDIDA")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Votar" })).toBeDisabled();
    expect(screen.getByTestId("question-row").className).toContain("opacity-40");
  });

  it("marks the vote button as pressed when voted_by_me", () => {
    render(
      <ul>
        <QuestionRow question={question({ voted_by_me: true })} />
      </ul>,
    );
    expect(screen.getByRole("button", { name: "Remover voto" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
