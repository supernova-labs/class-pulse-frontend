import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router";
import { ApiError } from "../api/client";
import { NebulaStage } from "../components/nebula/NebulaStage";
import { StarField } from "../components/nebula/StarField";
import { LiveDot } from "../components/ui/LiveDot";
import { useQuestionsPolling } from "../hooks/useQuestionsPolling";

const MURAL_MAX = 24;

// sized for projection: read from a few metres away, across the room
const QR_SIZE = 160;

const SCREEN_BG =
  "radial-gradient(760px 480px at 24% 40%, rgb(124 108 255 / 0.12), transparent 62%), radial-gradient(520px 360px at 92% 108%, rgb(124 108 255 / 0.06), transparent 60%), #05050a";

export default function ScreenPage() {
  const { code = "" } = useParams();
  const { session, questions, isEnded, isLoading, error } = useQuestionsPolling(code);

  // /s/:code carries the code, so nobody types it; first-timers still pass through
  // /join to pick a name, which the telão renders as author_name
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
      className="relative flex h-dvh flex-col overflow-hidden text-foreground"
      style={{ background: SCREEN_BG }}
    >
      <StarField seed={code} />

      {/* the header sizes itself (the QR card drives its height); the stage takes what is left */}
      <header className="relative z-10 flex shrink-0 items-start justify-between px-12 py-7">
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

      <div className="relative z-10 min-h-0 flex-1 px-12 pb-10">
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
