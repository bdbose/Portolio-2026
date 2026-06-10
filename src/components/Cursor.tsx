"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Only on devices with a fine pointer (mouse / trackpad)
function subscribeToFinePointer(onChange: () => void) {
  const mql = window.matchMedia("(pointer: fine)");
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Custom cursor: a small dot + a trailing ring.
 * Elements with [data-cursor="hover"] grow the ring;
 * [data-cursor="view"] turns it into a labeled "View" badge.
 */
export default function Cursor() {
  const enabled = useSyncExternalStore(
    subscribeToFinePointer,
    () => window.matchMedia("(pointer: fine)").matches,
    () => false
  );
  const [variant, setVariant] = useState<"default" | "hover" | "view">(
    "default"
  );

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 400, damping: 35 });
  const ringY = useSpring(y, { stiffness: 400, damping: 35 });

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.("[data-cursor]");
      if (target) {
        const kind = target.getAttribute("data-cursor");
        setVariant(kind === "view" ? "view" : "hover");
      } else {
        setVariant("default");
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  // The ring renders at a fixed 88px and scales down, so variant changes
  // animate transform only (no layout writes). The "View" label is only
  // shown at scale 1, so it never needs counter-scaling.
  const scale = variant === "view" ? 1 : variant === "hover" ? 56 / 88 : 32 / 88;

  return (
    <>
      {/* Center dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[110] h-1.5 w-1.5 rounded-full bg-accent"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Trailing ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[109] flex h-[88px] w-[88px] items-center justify-center rounded-full border border-foreground/30"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale,
          backgroundColor:
            variant === "view" ? "rgba(255,138,61,0.9)" : "rgba(255,138,61,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {variant === "view" && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-background">
            View
          </span>
        )}
      </motion.div>
    </>
  );
}
