import { useState } from "react";
import type { AdminSession } from "../../api/types";
import { buildJoinUrl } from "../../lib/joinUrl";
import { CheckIcon, CopyIcon } from "../ui/icons";
import { LiveDot } from "../ui/LiveDot";
import { Spinner } from "../ui/Spinner";

interface ActiveSessionCardProps {
  session: AdminSession;
  questionCount: number;
  voteCount: number;
  ending?: boolean;
  onEnd: () => void;
}

const iconTransition =
  "absolute left-0 top-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)]";

export function ActiveSessionCard({
  session,
  questionCount,
  voteCount,
  ending,
  onEnd,
}: ActiveSessionCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const copied = copyState === "copied";
  const joinUrl = buildJoinUrl(session.code);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      // clipboard unavailable/denied: show the link for manual copy
      setCopyState("failed");
    }
  };

  return (
    <section className="rounded-2xl border border-accent/35 bg-accent/[0.04] p-6 shadow-[0_0_36px_rgb(124_108_255/0.08)]">
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
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all ${
            copied
              ? "border-accent/50 bg-accent/15 text-accent-soft"
              : "border-surface text-foreground/85 hover:border-muted-strong"
          }`}
        >
          <span className="relative inline-block size-[13px] shrink-0">
            <CopyIcon
              className={iconTransition}
              style={{
                opacity: copied ? 0 : 1,
                transform: copied ? "scale(0.6) rotate(20deg)" : "scale(1) rotate(0deg)",
              }}
            />
            <CheckIcon
              className={iconTransition}
              style={{
                opacity: copied ? 1 : 0,
                transform: copied ? "scale(1) rotate(0deg)" : "scale(0.6) rotate(-20deg)",
              }}
            />
          </span>
          {copied ? "Link copiado" : "Copiar link"}
        </button>
        <button
          type="button"
          onClick={onEnd}
          disabled={ending}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-danger-strong/50 px-4 py-2 text-sm text-danger hover:border-danger disabled:opacity-60"
        >
          {ending && <Spinner />}
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
