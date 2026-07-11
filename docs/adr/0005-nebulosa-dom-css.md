# ADR 0005 — Nebulosa rendered in DOM/CSS with a pure layout function

Date: 2026-07-11
Status: accepted

## Context

The big screen renders questions as a floating constellation: size and glow
proportional to votes, the most-voted centered, answered stars drifting to the edge.
It must be readable from the back of a room, animate smoothly as ranks change every
poll, and be testable (unit + Playwright).

## Decisions

1. **Plain DOM/CSS, no canvas/SVG/animation library.** Each star is an absolutely
   positioned div keyed by question id; `left/top/transform/opacity` carry CSS
   transitions, so when a poll changes ranks the browser interpolates the glide —
   no JS animation loop. `prefers-reduced-motion` disables transitions.
2. **Layout is a pure function** (`computeNebulaLayout`): deterministic slot table
   (1 center + 8 orbit positions, capped text widths guarantee no overlap without a
   collision solver), `scale/brightness ∝ √(votes/max)` so the leader doesn't dwarf
   the rest, at most 4 recently answered stars parked dimmed at the edges, overflow
   surfaced as a "+N perguntas" counter.
3. Background starfield uses a PRNG seeded by the session code — stable across
   renders and screenshots.

## Alternatives considered

- **Canvas**: smooth for thousands of nodes we don't have; blurry text at projector
  scale, manual text wrapping, and invisible to Playwright selectors.
- **SVG**: same text-layout pain, no real win for ~10 nodes.
- **Physics/force layout**: organic but non-deterministic — untestable and visually
  restless on a screen people stare at for an hour.

## Consequences

- ~10 GPU-composited nodes — no measurable cost.
- The layout function is fully unit-tested (center assignment, caps, overflow,
  monotonic scaling, answered parking) without touching the DOM.
- E2E finds questions with `getByText` because stars are real text nodes.
