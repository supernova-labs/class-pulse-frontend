import type { Question } from "../../api/types";

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
              <p className="leading-snug">{question.body}</p>
              <p className="mt-0.5 text-xs text-muted">{question.author_name}</p>
            </div>
            <button
              type="button"
              title={answered ? "Reabrir pergunta" : "Marcar como respondida"}
              aria-label={answered ? "Reabrir pergunta" : "Marcar como respondida"}
              onClick={() => onToggleAnswered(question)}
              className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-sm ${
                answered
                  ? "border-accent bg-accent/20 text-accent-soft"
                  : "border-surface text-muted hover:border-muted-strong"
              }`}
            >
              ✓
            </button>
            <button
              type="button"
              title="Deletar pergunta"
              aria-label="Deletar pergunta"
              onClick={() => onDelete(question)}
              className="shrink-0 rounded-lg border border-surface px-2.5 py-1.5 text-sm text-muted hover:border-danger-strong hover:text-danger"
            >
              🗑
            </button>
          </li>
        );
      })}
    </ul>
  );
}
