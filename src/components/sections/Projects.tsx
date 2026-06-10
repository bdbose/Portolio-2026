"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import SectionHeading from "@/components/anim/SectionHeading";
import TiltCard from "@/components/anim/TiltCard";
import Reveal from "@/components/anim/Reveal";
import Magnetic from "@/components/anim/Magnetic";
import { projects, type Project } from "@/lib/data";

/**
 * Deterministic per-card gradient washes — all held on the saffron accent
 * hue (hsl ≈ 24°), varying position, lightness and alpha so the strict
 * mono + saffron palette stays intact. No randomness; index-mapped.
 */
const GRADIENTS: string[] = [
  "radial-gradient(70% 90% at 85% 0%, hsla(24, 100%, 58%, 0.28), transparent 70%)",
  "radial-gradient(70% 90% at 15% 100%, hsla(24, 90%, 52%, 0.22), transparent 70%)",
  "radial-gradient(80% 80% at 100% 80%, hsla(24, 95%, 62%, 0.18), transparent 70%)",
  "radial-gradient(70% 90% at 0% 0%, hsla(24, 75%, 48%, 0.16), transparent 70%)",
  "radial-gradient(80% 80% at 50% 110%, hsla(24, 85%, 66%, 0.18), transparent 70%)",
  "radial-gradient(70% 90% at 100% 15%, hsla(24, 80%, 55%, 0.14), transparent 70%)",
  "radial-gradient(80% 90% at 10% 20%, hsla(24, 92%, 60%, 0.2), transparent 70%)",
  "radial-gradient(75% 85% at 90% 100%, hsla(24, 70%, 50%, 0.16), transparent 70%)",
];

/**
 * Deterministic fake commit hash derived from a project title — a quiet
 * systems-engineer texture. Pure charCode fold → hex, identical on the
 * server and the client (hydration safe).
 */
function commitHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 7);
}

type CardProps = {
  project: Project;
  gradient: string;
  className?: string;
};

function Card({ project, gradient, className }: CardProps) {
  return (
    <TiltCard className={className}>
      <article
        className={`group relative isolate flex min-h-[26rem] flex-col justify-between gap-6 overflow-hidden rounded-3xl border bg-surface p-7 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-10 lg:h-[26rem] ${
          project.accent
            ? "border-accent/40 hover:border-accent/70"
            : "border-line hover:border-white/20"
        }`}
      >
        {/* gradient wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-80"
          style={{ background: gradient }}
        />

        {/* top row: index + commit hash + tags */}
        <div className="flex items-start justify-between gap-4">
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-accent">
              / {project.index}
            </span>
            <span
              aria-hidden="true"
              className="font-mono text-[10px] tracking-[0.15em] text-foreground/40"
            >
              #{commitHash(project.title)}
            </span>
          </span>
          <div className="flex max-w-[60%] flex-wrap justify-end gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors duration-500 group-hover:border-white/20 group-hover:text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* middle: title + description */}
        <div>
          <h3 className="font-display text-3xl font-bold uppercase leading-[1.02] tracking-tight md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {project.description}
          </p>
        </div>
      </article>
    </TiltCard>
  );
}

/** End-of-gallery tease — magnetic circular CTA scrolling to #contact. */
function EndTease() {
  const lenis = useLenis();
  return (
    <div className="flex w-[20rem] shrink-0 items-center justify-center">
      <Magnetic>
        <button
          type="button"
          data-cursor="hover"
          aria-label="Scroll to the contact section"
          onClick={() => lenis?.scrollTo("#contact", { offset: 0 })}
          className="flex h-44 w-44 items-center justify-center rounded-full border border-line font-mono text-xs uppercase tracking-[0.3em] text-foreground transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent focus-visible:outline-none"
        >
          Let&apos;s talk&nbsp;↗
        </button>
      </Magnetic>
    </div>
  );
}

export default function Projects() {
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 120,
  });

  // Measure how far the track must translate so the gallery always ends
  // exactly at the last item (+80px right breathing room to mirror pl-20),
  // regardless of viewport width. scrollWidth includes the overflowing
  // shrink-0 children even though the track's border-box is viewport-wide.
  const [maxShift, setMaxShift] = useState(0);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () =>
      setMaxShift(Math.max(0, track.scrollWidth - window.innerWidth + 80));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const x = useTransform(progress, [0, 1], [0, -maxShift]);

  return (
    <section id="projects" className="relative">
      {/* ───────── desktop: pinned horizontal gallery ───────── */}
      <div ref={targetRef} className="relative hidden h-[420vh] lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="px-6 md:px-12 lg:px-20">
            <div className="mx-auto max-w-[1600px]">
              <SectionHeading index="04" title="Projects" compact />
            </div>
          </div>

          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex flex-row gap-8 pl-6 md:pl-12 lg:pl-20"
          >
            {projects.map((project, i) => (
              <Card
                key={project.index}
                project={project}
                gradient={GRADIENTS[i % GRADIENTS.length]}
                className="w-[34rem] max-w-[85vw] shrink-0"
              />
            ))}
            <EndTease />
          </motion.div>

          {/* horizontal progress indicator */}
          <div className="mt-12 px-6 md:px-12 lg:px-20">
            <div className="mx-auto h-[2px] max-w-[1600px] overflow-hidden bg-line">
              <motion.div
                style={{ scaleX: progress }}
                className="h-full w-full origin-left bg-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ───────── mobile / tablet: stacked cards ───────── */}
      <div className="px-6 py-24 md:px-12 md:py-40 lg:hidden">
        <div className="mx-auto max-w-[1600px]">
          <SectionHeading index="04" title="Projects" />
          <div className="flex flex-col gap-8">
            {projects.map((project, i) => (
              <Reveal key={project.index} delay={i * 0.05}>
                <Card
                  project={project}
                  gradient={GRADIENTS[i % GRADIENTS.length]}
                  className="w-full"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
