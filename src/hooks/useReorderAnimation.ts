import { useLayoutEffect, useRef } from "react";

// FLIP: when the list order changes (a vote reshuffles it), slide each row from its
// previous position to the new one instead of snapping. `orderKey` is the joined ids.
export function useReorderAnimation(orderKey: string) {
  const elements = useRef(new Map<string, HTMLElement>());
  const prevRects = useRef(new Map<string, DOMRect>());
  const running = useRef(new Map<string, Animation>());
  // cache the callback ref per id so its identity is stable across renders —
  // otherwise React detaches/reattaches every row from the registry on each update
  const refCallbacks = useRef(new Map<string, (el: HTMLElement | null) => void>());

  useLayoutEffect(() => {
    // settle any in-flight animation before measuring, so we read layout positions
    // (not mid-transform ones) when votes reshuffle the list in quick succession
    running.current.forEach((animation) => {
      animation.finish();
    });
    running.current.clear();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextRects = new Map<string, DOMRect>();
    elements.current.forEach((el, id) => {
      nextRects.set(id, el.getBoundingClientRect());
    });

    if (!reduceMotion) {
      nextRects.forEach((next, id) => {
        const prev = prevRects.current.get(id);
        const el = elements.current.get(id);
        if (!prev || !el) return;
        const deltaY = prev.top - next.top;
        if (Math.abs(deltaY) > 1) {
          const animation = el.animate(
            [{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }],
            { duration: 340, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
          running.current.set(id, animation);
          animation.onfinish = () => {
            if (running.current.get(id) === animation) running.current.delete(id);
          };
        }
      });
    }
    prevRects.current = nextRects;
  }, [orderKey]);

  return (id: string) => {
    const cache = refCallbacks.current;
    let callback = cache.get(id);
    if (!callback) {
      callback = (el: HTMLElement | null) => {
        if (el) elements.current.set(id, el);
        else elements.current.delete(id);
      };
      cache.set(id, callback);
    }
    return callback;
  };
}
