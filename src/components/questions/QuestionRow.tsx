import type { Ref } from "react";
import type { Question } from "../../api/types";
import { VoteButton } from "./VoteButton";

interface QuestionRowProps {
  question: Question;
  index?: number;
  onToggleVote?: (question: Question) => void;
  readOnly?: boolean;
  ref?: Ref<HTMLLIElement>;
}

export function QuestionRow({
  question,
  index = 0,
  onToggleVote,
  readOnly,
  ref,
}: QuestionRowProps) {
  const answered = question.status === "answered";
  return (
    <li
      ref={ref}
      data-testid="question-row"
      // entrance animation on mount (new live questions rise in); answered rows just dim
      style={answered ? undefined : { animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className={`flex items-start gap-3 border-b border-surface py-4 ${
        answered ? "opacity-40" : "animate-rise"
      }`}
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
