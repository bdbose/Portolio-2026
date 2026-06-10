"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Parallax from "@/components/anim/Parallax";
import Reveal from "@/components/anim/Reveal";
import SectionHeading from "@/components/anim/SectionHeading";
import { EASE } from "@/components/anim/SplitText";
import { capabilities, type Capability } from "@/lib/data";

function CapabilityRow({
  capability,
  rowIndex,
  isOpen,
  onToggle,
}: {
  capability: Capability;
  rowIndex: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `capability-panel-${capability.index}`;

  return (
    <div
      className={`border-b border-line ${rowIndex === 0 ? "border-t" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        data-cursor="hover"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-6 py-8 text-left md:py-10"
      >
        <span className="font-mono text-sm text-accent">
          {capability.index}
        </span>
        <span
          className={`font-display text-2xl font-bold uppercase transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 md:text-4xl ${
            isOpen ? "text-accent" : "text-foreground"
          }`}
        >
          {capability.title}
        </span>
        <motion.span
          className="font-mono text-2xl text-muted"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          aria-hidden="true"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`panel-${capability.index}`}
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 pb-10 lg:grid-cols-[1fr_1.4fr]">
              <p className="max-w-md text-base text-muted md:text-lg">
                {capability.blurb}
              </p>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {capability.items.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: EASE,
                      delay: 0.15 + i * 0.05,
                    }}
                    className="font-mono text-xs text-foreground/80 md:text-[13px]"
                  >
                    <span className="text-accent" aria-hidden="true">
                      —{" "}
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Capabilities() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="capabilities"
      className="relative overflow-hidden py-24 md:py-40"
    >
      {/* Faint drifting backdrop word */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <Parallax speed={0.6} className="absolute -right-[3vw] top-[28%]">
          <span className="text-stroke select-none whitespace-nowrap font-display text-[18vw] font-bold uppercase leading-none opacity-20">
            SYSTEMS
          </span>
        </Parallax>
      </div>

      <div className="relative px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1600px]">
          <SectionHeading index="02" title="What I Do" />

          <div>
            {capabilities.map((capability, i) => (
              <Reveal key={capability.index} delay={i * 0.06}>
                <CapabilityRow
                  capability={capability}
                  rowIndex={i}
                  isOpen={open === i}
                  onToggle={() => setOpen(open === i ? null : i)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
