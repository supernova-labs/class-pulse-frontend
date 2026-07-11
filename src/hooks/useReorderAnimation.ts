import { useLayoutEffect, useRef } from "react";

// FLIP: when the list order changes (a vote reshuffles it), slide each row from its
// previous position to the new one instead of snapping. `orderKey` is the joined ids.
export function useReorderAnimation(orderKey: string) {
  const elements = useRef(new Map<string, HTMLElement>());
  const prevRects = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
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
          el.animate([{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }], {
            duration: 340,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          });
        }
      });
    }
    prevRects.current = nextRects;
  }, [orderKey]);

  return (id: string) => (el: HTMLElement | null) => {
    if (el) elements.current.set(id, el);
    else elements.current.delete(id);
  };
}
