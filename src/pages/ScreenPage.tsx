import { useMemo } from "react";
import { useParams } from "react-router";
import { ApiError } from "../api/client";
import { NebulaStage } from "../components/nebula/NebulaStage";
import { StarField } from "../components/nebula/StarField";
import { LiveDot } from "../components/ui/LiveDot";
import { useQuestionsPolling } from "../hooks/useQuestionsPolling";
import { computeNebulaLayout } from "../lib/nebula";

export default function ScreenPage() {
  const { code = "" } = useParams();
  const { session, questions, isEnded, isLoading, error } = useQuestionsPolling(code);

  const layout = useMemo(() => computeNebulaLayout(questions), [questions]);
  const questionsById = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions],
  );

  // only fail hard when there is no data yet; a live screen survives transient errors
  if (error && !session) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <main className="flex h-dvh items-center justify-center bg-background">
        <p className="text-muted">
          {notFound
            ? "Sessão não encontrada — confira o código."
            : "Não foi possível carregar o telão — verifique a conexão."}
        </p>
      </main>
    );
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_center,rgb(124_108_255/0.08),transparent_65%)]">
      <StarField seed={code} />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-6">
        <p className="flex items-center gap-2.5 text-lg text-muted">
          {isEnded ? (
            <span className="rounded border border-muted-strong px-2 py-0.5 font-mono text-[10px] tracking-widest">
              ENCERRADA
            </span>
          ) : (
            <LiveDot />
          )}
          {session?.name ?? ""}
        </p>
        <p className="font-mono text-2xl tracking-[0.15em] text-accent-soft">
          {code.toUpperCase()}
        </p>
      </header>

      <div className="absolute inset-x-0 top-20 bottom-12">
        {isLoading ? null : questions.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="animate-halo text-xl text-accent-soft">Aguardando perguntas…</p>
          </div>
        ) : (
          <NebulaStage stars={layout.stars} questionsById={questionsById} />
        )}
      </div>

      {layout.overflow > 0 && (
        <p className="absolute bottom-5 right-8 z-10 font-mono text-sm text-muted-strong">
          +{layout.overflow} perguntas
        </p>
      )}
    </main>
  );
}
