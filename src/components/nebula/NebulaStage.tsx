import type { Question } from "../../api/types";
import { UpvoteIcon } from "../ui/icons";

interface NebulaStageProps {
  hero: Question | undefined;
  rest: Question[];
  total: number;
  overflow: number;
}

// Telão layout: one glowing hero (most voted) + a dense, readable ranked mural.
export function NebulaStage({ hero, rest, total, overflow }: NebulaStageProps) {
  if (!hero) return null;
  return (
    <div className="grid h-full grid-cols-1 gap-10 lg:grid-cols-[42%_1fr] lg:gap-14">
      <div className="relative isolate flex flex-col justify-center gap-5">
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[540px] max-w-[130%] -translate-x-1/2 -translate-y-1/2 animate-halo rounded-full bg-[radial-gradient(closest-side,rgb(124_108_255/0.16),transparent_70%)]"
        />
        <p className="font-mono text-xs font-semibold tracking-[0.22em] text-accent-soft">
          MAIS VOTADA
        </p>
        <p className="text-4xl font-semibold text-balance text-white [text-shadow:0_0_60px_rgb(124_108_255/0.4)] xl:text-5xl xl:leading-tight">
          {hero.body}
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/15 px-4 py-1.5 text-lg font-semibold text-accent-soft shadow-[0_0_24px_rgb(124_108_255/0.25)]">
            <UpvoteIcon /> {hero.votes}
          </span>
          <span className="text-muted">{hero.author_name}</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-4">
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-muted-strong">
          TODAS AS PERGUNTAS · {total}
        </p>
        <div className="relative min-h-0 flex-1">
          <div className="grid h-full grid-cols-1 content-start gap-x-12 overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent)] [mask-image:linear-gradient(to_bottom,black_80%,transparent)] md:grid-cols-2">
            {rest.map((question) => (
              <div
                key={question.id}
                className="flex items-start gap-3.5 border-b border-white/[0.06] py-3"
              >
                <span className="w-7 shrink-0 text-right font-mono tabular-nums text-accent-soft">
                  {question.votes}
                </span>
                <div className="min-w-0">
                  <p className="leading-snug text-pretty text-foreground/85">{question.body}</p>
                  <p className="text-xs text-muted-strong">{question.author_name}</p>
                </div>
              </div>
            ))}
          </div>
          {overflow > 0 && (
            <p className="absolute inset-x-0 bottom-0 text-center font-mono text-sm text-muted-strong">
              + {overflow} perguntas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
