"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/components/useIsMobile";

type SceneCanvasProps = {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
};

/**
 * Shared transparent canvas. The frameloop only runs while the canvas is
 * actually on screen, and collapses to on-demand frames for users who
 * prefer reduced motion — offscreen or static scenes cost nothing.
 */
export default function SceneCanvas({
  children,
  className = "",
  camera = { position: [0, 0, 6], fov: 42 },
}: SceneCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "15% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        frameloop={reduced ? "demand" : inView ? "always" : "never"}
        // Mobile GPUs choke on high pixel ratios + MSAA when every point is
        // additively blended — cap the ratio and drop antialiasing on phones.
        dpr={isMobile ? [1, 1.25] : [1, 1.75]}
        flat
        camera={camera}
        gl={{
          alpha: true,
          antialias: !isMobile,
          powerPreference: "high-performance",
        }}
      >
        {children}
      </Canvas>
    </div>
  );
}
