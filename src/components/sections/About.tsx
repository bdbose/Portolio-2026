"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import SectionHeading from "@/components/anim/SectionHeading";
import Reveal from "@/components/anim/Reveal";
import Counter from "@/components/anim/Counter";
import Parallax from "@/components/anim/Parallax";
import { profile, stats, education } from "@/lib/data";

type WordProps = {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
};

/** One word of the summary — fades from ghost to full as scroll passes it. */
function Word({ word, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className="text-foreground">
        {word}
      </motion.span>{" "}
    </>
  );
}

export default function About() {
  const paragraphRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = profile.summary.split(" ");

  return (
    <section
      id="about"
      className="relative overflow-hidden px-6 py-24 md:px-12 md:py-40 lg:px-20"
    >
      <div className="mx-auto max-w-[1600px]">
        <SectionHeading index="01" title="About" />

        {/* Scroll-progress text highlight */}
        <div ref={paragraphRef}>
          <p className="max-w-5xl font-display text-[clamp(1.5rem,3.2vw,3rem)] font-medium leading-snug">
            {words.map((word, i) => (
              <Word
                key={`${word}-${i}`}
                word={word}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
              />
            ))}
          </p>
        </div>

        {/* Supporting copy + education */}
        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="mb-6 block font-mono text-xs uppercase tracking-[0.3em] text-muted">
              / The work behind it
            </span>
            <p className="max-w-xl leading-relaxed text-muted">
              The last few years at SaffronStays meant migrating Node.js APIs
              to Golang for a 150%+ improvement in response times, building an
              NLP chatbot and villa recommendation engine on Python and
              Elasticsearch, and shipping SYNC — a full inventory dashboard
              with a calendar built entirely from scratch. Lately the work
              goes lower in the stack too: a custom DNS server with automatic
              SSL, powering white-label hosting for an entire platform.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-line bg-surface p-8">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                Education
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold uppercase leading-tight md:text-3xl">
                {education.degree}
              </h3>
              <p className="mt-3 text-muted">{education.school}</p>
              <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-muted">
                {education.period}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Stats strip with parallax backdrop */}
        <div className="relative mt-24">
          <Parallax
            speed={0.8}
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center opacity-40"
          >
            <span
              aria-hidden
              className="text-stroke select-none whitespace-nowrap font-display text-[clamp(5rem,16vw,14rem)] font-bold uppercase leading-none tracking-tight"
            >
              Engineer
            </span>
          </Parallax>

          <div className="grid grid-cols-2 divide-x divide-line border-y border-line lg:grid-cols-4 max-lg:[&>div:nth-child(2)]:border-e-0 max-lg:[&>div:nth-child(3)]:border-s-0 max-lg:[&>div:nth-child(n+3)]:border-t max-lg:[&>div:nth-child(n+3)]:border-t-line">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1} className="p-8 md:p-12">
                <div className="font-display text-5xl font-bold md:text-7xl">
                  <Counter value={stat.value} />
                  <span className="text-accent">{stat.suffix}</span>
                </div>
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
