import { useMemo } from "react";

// Deterministic PRNG so the background is stable across renders and tests.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return hash;
}

export function StarField({ seed, count = 70 }: { seed: string; count?: number }) {
  const dots = useMemo(() => {
    const random = mulberry32(seedFromString(seed));
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      x: random() * 100,
      y: random() * 100,
      size: 1 + random() * 2,
      delay: random() * 3.4,
    }));
  }, [seed, count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="absolute rounded-full bg-accent-soft animate-twinkle"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
