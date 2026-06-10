"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import SectionHeading from "@/components/anim/SectionHeading";
import Reveal from "@/components/anim/Reveal";
import Parallax from "@/components/anim/Parallax";
import { EASE } from "@/components/anim/SplitText";
import { experience } from "@/lib/data";

type RowProps = {
  item: (typeof experience)[number];
  rowIndex: number;
};

function Row({ item, rowIndex }: RowProps) {
  return (
    <Reveal y={60} delay={rowIndex * 0.05}>
      <article className="group border-b border-line py-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <h3 className="font-display text-3xl font-bold uppercase leading-none tracking-tight transition-colors duration-500 group-hover:text-accent md:text-5xl">
            {item.company}
          </h3>
          <span className="shrink-0 font-mono text-xs uppercase tracking-[0.3em] text-muted md:text-right">
            {item.period}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">
            {item.role}
          </p>
          {item.location ? (
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {item.location}
            </p>
          ) : null}
        </div>

        <ul className="mt-6 space-y-3">
          {item.highlights.map((highlight, i) => (
            <motion.li
              key={highlight}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
              className="flex gap-3 text-sm leading-relaxed text-muted md:text-base"
            >
              <span aria-hidden="true" className="select-none text-accent">
                —
              </span>
              <span>{highlight}</span>
            </motion.li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.6", "end 0.9"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.4,
  });

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative overflow-hidden px-6 py-24 md:px-12 md:py-40 lg:px-20"
    >
      {/* Huge ghost word drifting behind the section */}
      <Parallax
        speed={-0.6}
        className="pointer-events-none absolute left-0 top-1/3 w-full opacity-30"
      >
        <span
          aria-hidden="true"
          className="text-stroke block whitespace-nowrap font-display text-[22vw] font-bold uppercase leading-none tracking-tight"
        >
          CAREER
        </span>
      </Parallax>

      <div className="relative mx-auto max-w-[1600px]">
        <SectionHeading index="03" title="Experience" />

        <div className="gap-16 lg:grid lg:grid-cols-[1fr_2fr]">
          {/* Sticky left rail */}
          <div className="mb-16 h-fit self-start lg:sticky lg:top-32 lg:mb-0">
            <Reveal y={32}>
              <p className="max-w-[28ch] font-mono text-xs uppercase leading-loose tracking-[0.3em] text-muted">
                5+ years across hospitality-tech, commerce and social
                platforms.
              </p>
            </Reveal>
            <div
              className="relative mt-10 h-64 w-px bg-line"
              aria-hidden="true"
            >
              <motion.div
                className="absolute inset-0 origin-top bg-accent"
                style={{ scaleY: progress }}
              />
            </div>
          </div>

          {/* Experience rows */}
          <div className="border-t border-line">
            {experience.map((item, i) => (
              <Row
                key={`${item.company}-${item.period}`}
                item={item}
                rowIndex={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
