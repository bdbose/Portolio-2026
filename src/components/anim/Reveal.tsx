"use client";

import { motion } from "framer-motion";
import { EASE } from "./SplitText";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** initial y offset in px */
  y?: number;
  /** start blurred and sharpen on reveal */
  blur?: boolean;
  duration?: number;
  once?: boolean;
};

/** Fade + rise (+ optional blur) reveal when scrolled into view. */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 48,
  blur = false,
  duration = 1,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, ...(blur && { filter: "blur(10px)" }) }}
      whileInView={{ opacity: 1, y: 0, ...(blur && { filter: "blur(0px)" }) }}
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
