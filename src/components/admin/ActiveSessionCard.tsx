import { useState } from "react";
import type { AdminSession } from "../../api/types";
import { LiveDot } from "../ui/LiveDot";

interface ActiveSessionCardProps {
  session: AdminSession;
  questionCount: number;
  voteCount: number;
  onEnd: () => void;
}

export function ActiveSessionCard({
  session,
  questionCount,
  voteCount,
  onEnd,
}: ActiveSessionCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const joinUrl = `${window.location.origin}/join?code=${encodeURIComponent(session.code)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // clipboard unavailable/denied: show the link for manual copy
      setCopyState("failed");
    }
  };

  return (
    <section className="rounded-2xl border border-accent/40 bg-surface/20 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-semibold">
            <LiveDot /> {session.name}
          </p>
          <p className="mt-1 text-sm text-muted">
            {questionCount} perguntas · {voteCount} votos
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono tracking-widest text-muted-strong">CÓDIGO</p>
          <p className="font-mono text-xl text-accent-soft">{session.code}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <a
          href={`/screen/${session.code}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Abrir telão
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-xl border border-surface px-4 py-2 text-sm hover:border-muted-strong"
        >
          {copyState === "copied" ? "✓ Copiado" : "⧉ Copiar link"}
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="ml-auto rounded-xl border border-danger-strong/50 px-4 py-2 text-sm text-danger hover:border-danger"
        >
          Encerrar sessão
        </button>
      </div>
      {copyState === "failed" && (
        <p role="alert" className="mt-3 text-xs text-muted">
          Não consegui copiar — use o link: <span className="font-mono select-all">{joinUrl}</span>
        </p>
      )}
    </section>
  );
}
