"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { EASE } from "@/components/anim/SplitText";
import Reveal from "@/components/anim/Reveal";
import Magnetic from "@/components/anim/Magnetic";
import { profile } from "@/lib/data";

const HOVER_SPRING = { type: "spring", stiffness: 400, damping: 12 } as const;

// Client-only: WebGL network globe rendered behind the name.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

/* ——— Interactive name: per-char masked reveal + hover play ——— */

type NameCharProps = {
  char: string;
  delay: number;
  stroke: boolean;
};

function NameChar({ char, delay, stroke }: NameCharProps) {
  // Mask clips during the entrance reveal; once entered, the mask opens so
  // the hover lift isn't clipped and the return transition drops the delay.
  const [entered, setEntered] = useState(false);

  return (
    <span
      className={`inline-block align-bottom ${
        entered ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      <motion.span
        className="inline-block cursor-default will-change-transform"
        initial={{ y: "115%", rotate: 4 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={
          entered ? HOVER_SPRING : { duration: 0.9, ease: EASE, delay }
        }
        onAnimationComplete={() => setEntered(true)}
        whileHover={
          stroke
            ? { y: -12, transition: HOVER_SPRING }
            : { y: -12, color: "#ff8a3d", transition: HOVER_SPRING }
        }
      >
        {char}
      </motion.span>
    </span>
  );
}

type NameLineProps = {
  text: string;
  delay: number;
  className?: string;
  /** stroke lines have a transparent fill — hover is lift-only */
  stroke?: boolean;
};

function NameLine({ text, delay, className = "", stroke = false }: NameLineProps) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-block whitespace-nowrap">
        {text.split("").map((char, i) => (
          <NameChar
            key={i}
            char={char}
            delay={delay + i * 0.04}
            stroke={stroke}
          />
        ))}
      </span>
    </span>
  );
}

/* ——— Decode label: chars resolve left-to-right from a glyph tape ——— */

const DECODE_GLYPHS = "█▓▒░/\\<>";
const DECODE_DURATION = 900; // ms

type DecodeProps = {
  text: string;
  /** seconds before decoding starts */
  delay?: number;
  className?: string;
};

function Decode({ text, delay = 0, className = "" }: DecodeProps) {
  // SSR / first paint renders the final text — no hydration mismatch.
  // The scramble only ever runs client-side, after mount.
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (start === null) start = ts + delay * 1000;
      const elapsed = ts - start;

      if (elapsed >= DECODE_DURATION) {
        setDisplay(text);
        return;
      }

      // Deterministic glyph cycling driven by the rAF timestamp.
      const frame = Math.floor(ts / 48);
      const resolved =
        elapsed <= 0
          ? 0
          : Math.floor((elapsed / DECODE_DURATION) * text.length);

      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (i < resolved || char === " ") return char;
            return DECODE_GLYPHS[(i + frame) % DECODE_GLYPHS.length];
          })
          .join("")
      );

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{display}</span>
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  // Suspend the infinite loops (blobs, star, dot, hairline) once the hero
  // scrolls out of view so their rAF work and composited blur layers stop.
  // Defaults to true (the hero is in view at load) so the intro
  // choreography is never retargeted on mount.
  const [heroInView, setHeroInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setHeroInView(entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The hero is a pinned scroll stage (Apple-style scrub): the inner
  // viewport sticks while ~1.6 extra viewports of scroll drive the acts —
  // name exit → globe takes centre stage → particle dissolve.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Act I — name block: drift, fade, gentle shrink.
  const nameY = useTransform(scrollYProgress, [0, 0.35], [0, 170]);
  const nameScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.94]);
  const topY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);
  const bottomY = useTransform(scrollYProgress, [0, 0.15], [0, 60]);

  // Act II — caption while the globe holds centre stage.
  const captionY = useTransform(scrollYProgress, [0.34, 0.6], [28, -16]);

  // Scroll-driven opacity fades. Written imperatively because MotionValue
  // style bindings for non-transform properties don't update under the
  // React canary bundled with this Next.js — transforms work, opacity
  // freezes at its initial value.
  const topFadeRef = useRef<HTMLDivElement>(null);
  const nameFadeRef = useRef<HTMLDivElement>(null);
  const bottomFadeRef = useRef<HTMLDivElement>(null);
  const captionFadeRef = useRef<HTMLParagraphElement>(null);
  const globeFadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ramp = (from: number, to: number, p: number) =>
      Math.min(1, Math.max(0, (p - from) / (to - from)));
    const set = (el: HTMLElement | null, v: number) => {
      if (el) el.style.opacity = String(Math.min(1, Math.max(0, v)));
    };
    const apply = (p: number) => {
      set(topFadeRef.current, 1 - ramp(0, 0.1, p));
      set(bottomFadeRef.current, 1 - ramp(0, 0.1, p));
      set(nameFadeRef.current, 1 - ramp(0.04, 0.26, p));
      set(
        captionFadeRef.current,
        Math.min(ramp(0.34, 0.42, p), 1 - ramp(0.52, 0.6, p))
      );
      set(globeFadeRef.current, 1 - ramp(0.6, 0.74, p));
    };
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [scrollYProgress]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`relative ${reducedMotion ? "" : "h-[260vh]"}`}
    >
      <div className="sticky top-0 flex min-h-svh flex-col justify-between overflow-hidden px-6 pt-28 pb-10 md:px-12 lg:px-20">
      {/* ——— Background: aurora blobs + vignette ——— */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.5, ease: EASE }}
      >
        <motion.div
          className="absolute -top-[12%] -left-[8%] aspect-square w-[44vw] rounded-full bg-accent/15 blur-[120px] will-change-transform"
          animate={
            heroInView
              ? { x: [0, 90, 0], y: [0, 60, 0], scale: [1, 1.18, 1] }
              : { x: 0, y: 0, scale: 1, transition: { duration: 0.6 } }
          }
          transition={{
            duration: 16,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-[30%] -right-[14%] aspect-square w-[38vw] rounded-full bg-accent/10 blur-[120px] will-change-transform"
          animate={
            heroInView
              ? { x: [0, -110, 0], y: [0, -70, 0], scale: [1, 1.12, 1] }
              : { x: 0, y: 0, scale: 1, transition: { duration: 0.6 } }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-[18%] left-[28%] aspect-square w-[40vw] rounded-full bg-accent/[0.08] blur-[140px] will-change-transform"
          animate={
            heroInView
              ? { x: [0, 70, 0], y: [0, -50, 0], scale: [1.05, 0.95, 1.05] }
              : { x: 0, y: 0, scale: 1.05, transition: { duration: 0.6 } }
          }
          transition={{
            duration: 13,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
        {/* subtle centered vignette */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_60%_55%_at_50%_50%,transparent_0%,rgba(7,7,7,0.65)_100%)]" />
      </motion.div>

      {/* ——— Background: network globe (three.js), scroll-scrubbed ——— */}
      <div
        ref={globeFadeRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.7, ease: EASE }}
        >
          <HeroScene progress={scrollYProgress} />
        </motion.div>
      </div>

      {/* ——— Act II caption: appears while the globe holds centre stage ——— */}
      <motion.p
        ref={captionFadeRef}
        aria-hidden
        className="pointer-events-none absolute bottom-[15%] left-1/2 z-10 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted opacity-0 md:text-xs"
        style={{ x: "-50%", y: captionY }}
      >
        <span className="text-accent">/</span> Systems, end to end
        <span className="mt-2 block text-[0.85em] text-muted/70">
          Go · React · AI infra · 99.99% uptime
        </span>
      </motion.p>

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between">
        {/* ——— Top row ——— */}
        <motion.div ref={topFadeRef} style={{ y: topY }}>
          <motion.div
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
          >
            <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted md:text-xs">
              <motion.span
                aria-hidden
                className="inline-block size-2 rounded-full bg-accent"
                animate={
                  heroInView
                    ? { opacity: [1, 0.25, 1], scale: [1, 0.75, 1] }
                    : { opacity: 1, scale: 1, transition: { duration: 0.4 } }
                }
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <Decode text="Available for select work" delay={0.35} />
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted md:text-xs">
              <Decode text="Kolkata, India — UTC+5:30" delay={0.5} />
            </p>
          </motion.div>
        </motion.div>

        {/* ——— Center: the name ——— */}
        <motion.div
          ref={nameFadeRef}
          className="flex flex-1 items-center will-change-transform"
          style={{ y: nameY, scale: nameScale }}
        >
          <h1 className="w-full font-display text-[clamp(4rem,15vw,16rem)] uppercase leading-[0.85] tracking-tight">
            <NameLine
              text={profile.firstName.toUpperCase()}
              delay={0.25}
              className="block text-foreground"
            />
            <span className="ml-[8vw] flex items-start gap-[0.08em]">
              <NameLine
                text={profile.lastName.toUpperCase()}
                delay={0.4}
                stroke
                className="block text-stroke"
              />
              <motion.span
                aria-hidden
                className="mt-[0.12em] inline-block text-[0.22em] leading-none text-accent will-change-transform"
                initial={{ opacity: 0 }}
                animate={
                  heroInView
                    ? { opacity: 1, rotate: 360 }
                    : { opacity: 1, rotate: 0, transition: { duration: 0.3 } }
                }
                transition={{
                  opacity: { duration: 0.9, delay: 0.8, ease: EASE },
                  rotate: { duration: 14, repeat: Infinity, ease: "linear" },
                }}
              >
                ✦
              </motion.span>
            </span>
          </h1>
        </motion.div>

        {/* ——— Bottom row ——— */}
        <motion.div ref={bottomFadeRef} style={{ y: bottomY }}>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-8">
            <Reveal delay={0.6} y={32}>
              <p className="max-w-xs font-mono text-[10px] uppercase tracking-[0.3em] text-muted md:text-xs">
                <span className="block text-foreground">{profile.role}</span>
                <span className="mt-2 block">
                  @ SaffronStays — ex Nykaa, Trell
                </span>
              </p>
            </Reveal>

            <Reveal delay={0.75} y={32}>
              <Magnetic strength={0.3}>
                <button
                  type="button"
                  data-cursor="hover"
                  aria-label="Scroll down to about section"
                  onClick={() => lenis?.scrollTo("#about", { offset: 0 })}
                  className="group flex size-28 items-center justify-center rounded-full border border-line font-mono text-[10px] uppercase tracking-[0.3em] text-muted transition-colors duration-500 hover:border-accent hover:text-foreground focus-visible:border-accent focus-visible:text-foreground focus-visible:outline-none"
                >
                  <span className="flex flex-col items-center gap-1.5">
                    Scroll
                    <motion.span
                      aria-hidden
                      animate={{ y: [0, 5, 0] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-accent"
                    >
                      ↓
                    </motion.span>
                  </span>
                </button>
              </Magnetic>
            </Reveal>
          </div>
        </motion.div>
      </div>

      {/* ——— Center-bottom: pulsing vertical hairline ——— */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 z-10 hidden h-20 w-px -translate-x-1/2 overflow-hidden sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8, ease: EASE }}
      >
        <motion.span
          className="block h-full w-full origin-top bg-line"
          animate={
            heroInView
              ? { scaleY: [0.15, 1, 0.15] }
              : { scaleY: 0.15, transition: { duration: 0.4 } }
          }
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      </div>
    </section>
  );
}
