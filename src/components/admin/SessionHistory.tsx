import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getQuestions } from "../../api/sessions";
import type { AdminSession } from "../../api/types";
import { QuestionRow } from "../questions/QuestionRow";

export function SessionHistory({ sessions }: { sessions: AdminSession[] }) {
  if (sessions.length === 0) {
    return <p className="mt-4 text-sm text-muted">Nenhuma sessão anterior.</p>;
  }
  return (
    <ul className="mt-2">
      {sessions.map((session) => (
        <HistoryRow key={session.id} session={session} />
      ))}
    </ul>
  );
}

function HistoryRow({ session }: { session: AdminSession }) {
  const [open, setOpen] = useState(false);
  const questions = useQuery({
    queryKey: ["history", session.code],
    queryFn: () => getQuestions(session.code),
    enabled: open,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const date = new Date(session.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <li className="border-b border-surface py-3">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate">{session.name}</p>
          <p className="text-xs text-muted">{date}</p>
        </div>
        <span className="font-mono text-xs text-muted-strong">{session.code}</span>
        <span className="text-sm text-muted">{session.question_count} perguntas</span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="shrink-0 text-sm text-accent-soft hover:underline"
        >
          {open ? "Fechar" : "Ver histórico →"}
        </button>
      </div>
      {open && (
        <div className="mt-2 pl-2">
          {questions.isLoading ? (
            <p className="text-sm text-muted">Carregando…</p>
          ) : (
            <ul>
              {(questions.data?.questions ?? []).map((question) => (
                <QuestionRow key={question.id} question={question} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
