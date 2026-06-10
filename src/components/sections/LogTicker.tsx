"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import Marquee from "@/components/anim/Marquee";
import { EASE } from "@/components/anim/SplitText";
import { logLines } from "@/lib/data";

/**
 * Thin full-bleed terminal log tape between hero and about —
 * production output scrolling past like a live stdout stream.
 */
export default function LogTicker() {
  return (
    <motion.div
      aria-hidden
      className="relative overflow-hidden border-y border-line bg-surface/60 py-3 md:py-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <Marquee baseVelocity={1.4}>
        {logLines.map((line) => (
          <Fragment key={line}>
            <span className="mx-8 whitespace-nowrap font-mono text-[11px] text-muted md:text-xs">
              <span className="mr-2 text-accent">▸</span>
              {line}
            </span>
            <span className="mx-8 text-foreground/20">{"//"}</span>
          </Fragment>
        ))}
      </Marquee>

      {/* stdout label pinned to the left edge */}
      <div className="absolute inset-y-0 left-0 z-10 hidden items-center gap-2 border-r border-line bg-background px-6 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60 md:flex">
        <motion.span
          className="text-accent"
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            times: [0, 0.5, 1],
            ease: "linear",
          }}
        >
          ▮
        </motion.span>
        stdout
      </div>

      {/* edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent md:left-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </motion.div>
  );
}
