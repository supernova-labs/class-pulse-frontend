import type { Question } from "../../api/types";
import { VoteButton } from "./VoteButton";

interface QuestionRowProps {
  question: Question;
  onToggleVote?: (question: Question) => void;
  readOnly?: boolean;
}

export function QuestionRow({ question, onToggleVote, readOnly }: QuestionRowProps) {
  const answered = question.status === "answered";
  return (
    <li
      data-testid="question-row"
      className={`flex items-start gap-3 border-b border-surface py-4 ${answered ? "opacity-40" : ""}`}
    >
      <VoteButton
        votes={question.votes}
        voted={question.voted_by_me}
        disabled={readOnly || answered}
        onClick={() => onToggleVote?.(question)}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{question.body}</p>
        <p className="mt-1 text-sm text-muted">{question.author_name}</p>
      </div>
      {answered && (
        <span className="mt-1 shrink-0 rounded border border-muted-strong px-2 py-0.5 font-mono text-[10px] tracking-widest text-muted">
          RESPONDIDA
        </span>
      )}
    </li>
  );
}
