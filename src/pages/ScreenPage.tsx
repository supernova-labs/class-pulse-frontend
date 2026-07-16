import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router";
import { ApiError } from "../api/client";
import { NebulaStage } from "../components/nebula/NebulaStage";
import { StarField } from "../components/nebula/StarField";
import { LiveDot } from "../components/ui/LiveDot";
import { useQuestionsPolling } from "../hooks/useQuestionsPolling";

const MURAL_MAX = 24;

// kept small enough to fit the header space the stage reserves below it (top-24)
const QR_SIZE = 120;

const SCREEN_BG =
  "radial-gradient(760px 480px at 24% 40%, rgb(124 108 255 / 0.12), transparent 62%), radial-gradient(520px 360px at 92% 108%, rgb(124 108 255 / 0.06), transparent 60%), #05050a";

export default function ScreenPage() {
  const { code = "" } = useParams();
  const { session, questions, isEnded, isLoading, error } = useQuestionsPolling(code);

  // the /s/:code route drops the participant straight into the session, no code typing
  const joinUrl = `${window.location.origin}/s/${code}`;

  // the telão shows only open questions, already ranked by the API; the top one is the hero
  const open = questions.filter((question) => question.status === "open");
  const hero = open[0];
  const rest = open.slice(1, 1 + MURAL_MAX);
  const overflow = Math.max(0, open.length - 1 - rest.length);

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
    <main
      className="relative h-dvh overflow-hidden text-foreground"
      style={{ background: SCREEN_BG }}
    >
      <StarField seed={code} />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-12 py-7">
        <p className="flex items-center gap-2.5 text-lg">
          {isEnded ? (
            <span className="rounded border border-muted-strong px-2 py-0.5 font-mono text-[10px] tracking-widest text-muted">
              ENCERRADA
            </span>
          ) : (
            <LiveDot />
          )}
          <span className="text-muted">{session?.name ?? ""}</span>
        </p>
        {code && (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-2.5">
            <QRCodeSVG
              value={joinUrl}
              size={QR_SIZE}
              level="M"
              marginSize={2}
              bgColor="#ffffff"
              fgColor="#06060a"
              title={`Escaneie para entrar na sessão ${code.toUpperCase()}`}
            />
            <p className="font-mono text-xl font-bold tracking-[0.15em] whitespace-nowrap text-background">
              {code.toUpperCase()}
            </p>
          </div>
        )}
      </header>

      <div className="absolute inset-x-0 top-24 bottom-10 px-12">
        {isLoading ? null : open.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="animate-halo text-2xl text-accent-soft">Aguardando perguntas…</p>
          </div>
        ) : (
          <NebulaStage hero={hero} rest={rest} total={open.length} overflow={overflow} />
        )}
      </div>
    </main>
  );
}
