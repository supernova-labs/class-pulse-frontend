import { useEffect, useState } from "react";
import type { Question } from "../../api/types";
import type { StarPlacement } from "../../lib/nebula";

interface NebulaStageProps {
  stars: StarPlacement[];
  questionsById: Map<string, Question>;
}

export function NebulaStage({ stars, questionsById }: NebulaStageProps) {
  return (
    <div className="relative h-full w-full">
      {stars.map((star) => {
        const question = questionsById.get(star.id);
        if (!question) return null;
        return <Star key={star.id} star={star} question={question} />;
      })}
    </div>
  );
}

function Star({ star, question }: { star: StarPlacement; question: Question }) {
  // Mount with opacity 0, then flip so the browser animates the fade-in.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const glow = 12 + 28 * star.brightness;
  const glowAlpha = 0.2 + 0.3 * star.brightness;

  return (
    <div
      data-testid="nebula-star"
      className={`absolute flex flex-col items-center text-center motion-safe:transition-all motion-safe:duration-700 ${
        star.isCenter ? "max-w-[38ch]" : "max-w-[22ch]"
      }`}
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: `translate(-50%, -50%) scale(${star.scale})`,
        opacity: mounted ? star.brightness : 0,
        transitionProperty: "left, top, transform, opacity",
      }}
    >
      {star.isCenter && (
        <>
          <span
            aria-hidden
            className="absolute -z-10 size-56 rounded-full bg-accent/20 blur-3xl animate-halo"
          />
          <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-accent-soft">
            MAIS VOTADA
          </p>
        </>
      )}
      <p
        className={`font-semibold leading-snug ${star.isCenter ? "text-3xl" : "text-lg"}`}
        style={{ textShadow: `0 0 ${glow}px rgb(124 108 255 / ${glowAlpha})` }}
      >
        {question.body}
      </p>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        <span className="rounded-md border border-accent/40 bg-accent/15 px-1.5 py-0.5 font-mono text-xs text-accent-soft">
          ▲ {question.votes}
        </span>
        {question.author_name}
      </p>
    </div>
  );
}
