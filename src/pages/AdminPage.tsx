import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  createSession,
  deleteQuestion,
  endSession,
  listSessions,
  moderateQuestion,
} from "../api/admin";
import { ApiError } from "../api/client";
import type { Question } from "../api/types";
import { ActiveSessionCard } from "../components/admin/ActiveSessionCard";
import { AdminLogin } from "../components/admin/AdminLogin";
import { ModerationList } from "../components/admin/ModerationList";
import { NewSessionForm } from "../components/admin/NewSessionForm";
import { SessionHistory } from "../components/admin/SessionHistory";
import { Spinner } from "../components/ui/Spinner";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useQuestionsPolling } from "../hooks/useQuestionsPolling";

export default function AdminPage() {
  const { isAuthenticated, login, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }
  return <AdminPanel onUnauthorized={logout} />;
}

function AdminPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const queryClient = useQueryClient();
  const sessionsQuery = useQuery({ queryKey: ["admin", "sessions"], queryFn: listSessions });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (sessionsQuery.error instanceof ApiError && sessionsQuery.error.status === 401) {
      onUnauthorized();
    }
  }, [sessionsQuery.error, onUnauthorized]);

  const sessions = sessionsQuery.data ?? [];
  const active = sessions.find((session) => session.status === "active");
  const history = sessions.filter((session) => session.status === "ended");

  // return the promises so mutations stay `isPending` until the caches actually refresh —
  // otherwise the button re-enables while the stale active session is still on screen
  const invalidateAll = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] }),
      queryClient.invalidateQueries({ queryKey: ["questions"] }),
    ]);

  // an expired/revoked token must send the admin back to the login screen
  const handleMutationError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) onUnauthorized();
  };

  const endMutation = useMutation({
    mutationFn: endSession,
    onSuccess: invalidateAll,
    onError: handleMutationError,
  });
  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: invalidateAll,
    onError: handleMutationError,
  });
  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "open" | "answered" }) =>
      moderateQuestion(id, status),
    onSuccess: invalidateAll,
    onError: handleMutationError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: invalidateAll,
    onError: handleMutationError,
  });

  const polling = useQuestionsPolling(active?.code ?? "", undefined, active !== undefined);
  const voteCount = polling.questions.reduce((sum, question) => sum + question.votes, 0);

  const handleEnd = () => {
    if (active && window.confirm(`Encerrar a sessão "${active.name}"?`)) {
      endMutation.mutate(active.id);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setTimeout(onUnauthorized, 500);
  };

  const handleToggleAnswered = (question: Question) => {
    const status = question.status === "answered" ? "open" : "answered";
    if (status === "answered" && !window.confirm("Marcar esta pergunta como respondida?")) {
      return;
    }
    moderateMutation.mutate({ id: question.id, status });
  };

  const handleDelete = (question: Question) => {
    if (window.confirm("Deletar esta pergunta? Ela some de todas as telas.")) {
      deleteMutation.mutate(question.id);
    }
  };

  return (
    <main className="min-h-dvh bg-glow">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Class Pulse <span className="font-normal text-muted">Gestão</span>
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground disabled:opacity-60"
          >
            {loggingOut && <Spinner />}
            Sair
          </button>
        </header>

        <h2 className="mt-8 font-mono text-xs tracking-[0.2em] text-muted-strong">SESSÃO ATIVA</h2>
        <div className="mt-3">
          {sessionsQuery.isLoading ? (
            <p className="text-sm text-muted">Carregando…</p>
          ) : active ? (
            <ActiveSessionCard
              session={active}
              questionCount={polling.questions.length}
              voteCount={voteCount}
              ending={endMutation.isPending}
              onEnd={handleEnd}
            />
          ) : (
            <p className="rounded-2xl border border-surface p-6 text-sm text-muted">
              Nenhuma sessão ativa.
            </p>
          )}
        </div>

        <h2 className="mt-8 font-mono text-xs tracking-[0.2em] text-muted-strong">NOVA SESSÃO</h2>
        <NewSessionForm
          hasActiveSession={active !== undefined}
          onCreate={(name) => createMutation.mutateAsync(name)}
        />

        {active && (
          <>
            <h2 className="mt-8 font-mono text-xs tracking-[0.2em] text-muted-strong">MODERAÇÃO</h2>
            <ModerationList
              questions={polling.questions}
              onToggleAnswered={handleToggleAnswered}
              onDelete={handleDelete}
            />
          </>
        )}

        <h2 className="mt-8 font-mono text-xs tracking-[0.2em] text-muted-strong">
          SESSÕES ANTERIORES
        </h2>
        <SessionHistory sessions={history} />
      </div>
    </main>
  );
}
