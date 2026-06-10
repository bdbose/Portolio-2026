"use client";

import { motion } from "framer-motion";
import SplitText, { EASE } from "./SplitText";

type SectionHeadingProps = {
  index: string; // e.g. "01"
  title: string; // e.g. "Experience"
  className?: string;
  /** tighter bottom margin for pinned / height-constrained layouts */
  compact?: boolean;
};

/**
 * Standard section header: mono index + huge display title with a
 * masked char reveal, underlined by a line that draws itself in.
 */
export default function SectionHeading({
  index,
  title,
  className = "",
  compact = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`${compact ? "mb-6 md:mb-10" : "mb-16 md:mb-24"} ${className}`}
    >
      <motion.span
        className="mb-4 block font-mono text-xs uppercase tracking-[0.3em] text-accent"
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        / {index}
      </motion.span>
      <SplitText
        as="h2"
        text={title}
        type="chars"
        stagger={0.03}
        className="font-display text-[clamp(2.75rem,8vw,7rem)] font-bold uppercase leading-[0.95] tracking-tight"
      />
      <motion.div
        className="mt-8 h-px w-full origin-left bg-line"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
      />
    </div>
  );
}
