"use client";

import { useSyncExternalStore } from "react";

// Phones / tablets and any coarse-pointer device: cut the most expensive
// effects (second WebGL canvas, high DPR, big animated blurs) so the page
// stays smooth on mobile GPUs.
const QUERY = "(max-width: 820px), (pointer: coarse)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** True on small / touch screens. SSR-safe (defaults to false). */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
