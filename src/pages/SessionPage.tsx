import { useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router";
import { askQuestion } from "../api/sessions";
import type { Question } from "../api/types";
import { AskForm } from "../components/questions/AskForm";
import { QuestionRow } from "../components/questions/QuestionRow";
import { LiveDot } from "../components/ui/LiveDot";
import { useParticipant } from "../hooks/useParticipant";
import { questionsQueryKey, useQuestionsPolling } from "../hooks/useQuestionsPolling";
import { useVoteToggle } from "../hooks/useVoteToggle";

export default function SessionPage() {
  const { code = "" } = useParams();
  const { participant } = useParticipant(code);

  if (!participant) {
    return <Navigate to={`/join?code=${encodeURIComponent(code)}`} replace />;
  }
  return <SessionView code={code} participantId={participant.participantId} />;
}

function SessionView({ code, participantId }: { code: string; participantId: string }) {
  const queryClient = useQueryClient();
  const { session, questions, isEnded, isLoading, error } = useQuestionsPolling(
    code,
    participantId,
  );
  const voteToggle = useVoteToggle(code, participantId);

  const handleAsk = async (body: string) => {
    await askQuestion(code, participantId, body);
    await queryClient.invalidateQueries({ queryKey: questionsQueryKey(code, participantId) });
  };

  const handleToggleVote = (question: Question) => {
    voteToggle.mutate({ questionId: question.id, voted: question.voted_by_me });
  };

  // serialize toggles per question: the button stays disabled while its request flies
  const pendingVoteId = voteToggle.isPending ? voteToggle.variables?.questionId : undefined;

  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg">Não conseguimos carregar essa sessão.</p>
          <p className="mt-2 text-sm text-muted">Confira o código ou tente recarregar.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <p className="truncate text-sm text-muted">{session?.name ?? "…"}</p>
        <p className="flex shrink-0 items-center gap-2 font-mono text-xs tracking-widest text-accent-soft">
          {isEnded ? (
            "ENCERRADA"
          ) : (
            <>
              <LiveDot /> AO VIVO
            </>
          )}
        </p>
      </header>

      {isEnded ? (
        <div className="mt-6 rounded-xl border border-surface bg-surface/30 px-4 py-3 text-center text-sm text-muted">
          Sessão encerrada — as perguntas ficam aqui como histórico.
        </div>
      ) : session ? (
        // gate on loaded session so an ended one is never briefly interactive
        <>
          <h1 className="mt-6 text-2xl font-semibold">O que você quer perguntar?</h1>
          <div className="mt-4">
            <AskForm onSubmit={handleAsk} />
          </div>
        </>
      ) : null}

      {isLoading ? (
        <p className="mt-10 text-center text-muted">Carregando…</p>
      ) : questions.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          Nenhuma pergunta ainda — seja a primeira pessoa a perguntar.
        </p>
      ) : (
        <ul className="mt-6">
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              onToggleVote={handleToggleVote}
              readOnly={isEnded || question.id === pendingVoteId}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
