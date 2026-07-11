import type { Question } from "../../api/types";
import { FormattedText } from "../ui/FormattedText";
import { AnsweredIcon, TrashIcon } from "../ui/icons";

interface ModerationListProps {
  questions: Question[];
  onToggleAnswered: (question: Question) => void;
  onDelete: (question: Question) => void;
}

export function ModerationList({ questions, onToggleAnswered, onDelete }: ModerationListProps) {
  if (questions.length === 0) {
    return <p className="mt-4 text-sm text-muted">Nenhuma pergunta ainda.</p>;
  }
  return (
    <ul className="mt-2">
      {questions.map((question) => {
        const answered = question.status === "answered";
        return (
          <li
            key={question.id}
            className={`flex items-start gap-3 border-b border-surface py-3 ${answered ? "opacity-40" : ""}`}
          >
            <span className="w-8 shrink-0 pt-0.5 text-right font-mono text-accent-soft">
              {question.votes}
            </span>
            <div className="min-w-0 flex-1">
              <FormattedText className="leading-snug">{question.body}</FormattedText>
              <p className="mt-0.5 text-xs text-muted">{question.author_name}</p>
            </div>
            <button
              type="button"
              title={answered ? "Reabrir pergunta" : "Marcar como respondida"}
              aria-label={answered ? "Reabrir pergunta" : "Marcar como respondida"}
              onClick={() => onToggleAnswered(question)}
              className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                answered
                  ? "border-surface text-muted hover:border-muted-strong"
                  : "border-accent/40 bg-accent/15 text-accent-soft hover:border-accent"
              }`}
            >
              <AnsweredIcon />
            </button>
            <button
              type="button"
              title="Deletar pergunta"
              aria-label="Deletar pergunta"
              onClick={() => onDelete(question)}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-danger-strong/25 text-danger-strong/80 hover:border-danger-strong/50 hover:text-danger"
            >
              <TrashIcon />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
