"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion, useScroll } from "framer-motion";

// Client-only: WebGL rocket that rides the page scroll.
const RocketScene = dynamic(() => import("./RocketScene"), { ssr: false });

/**
 * Fixed full-page layer hosting the scroll-companion rocket. It "launches"
 * once the hero's pinned globe sequence hands off to the content sections,
 * and hides again at the top. Hidden via display:none so the canvas
 * frameloop fully stops while the hero owns the screen (and never mounts
 * for reduced-motion users).
 */
export default function ScrollRocket() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (reduced) return;
    const apply = (p: number) => {
      const el = wrapRef.current;
      if (!el) return;
      const o = Math.min(1, Math.max(0, (p - 0.16) / 0.045));
      el.style.opacity = String(o);
      el.style.display = o <= 0 ? "none" : "block";
    };
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [scrollYProgress, reduced]);

  if (reduced) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 hidden opacity-0"
    >
      <RocketScene progress={scrollYProgress} />
    </div>
  );
}
