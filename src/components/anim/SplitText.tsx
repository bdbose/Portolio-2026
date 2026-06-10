"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

type SplitTextProps = {
  text: string;
  className?: string;
  /** seconds before the first unit animates */
  delay?: number;
  /** seconds between units */
  stagger?: number;
  /** animate per character or per word */
  type?: "chars" | "words";
  once?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
};

/**
 * Splits text into words/chars and reveals each from below its own
 * clipping line — the classic masked text reveal.
 */
export default function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.025,
  type = "chars",
  once = true,
  as: Tag = "span",
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-10% 0px" });

  const words = text.split(" ");
  let unitIndex = 0;

  const variants: Variants = {
    hidden: { y: "115%", rotate: 4 },
    visible: (i: number) => ({
      y: "0%",
      rotate: 0,
      transition: {
        duration: 0.9,
        ease: EASE,
        delay: delay + i * stagger,
      },
    }),
  };

  return (
    <Tag className={className}>
      <span ref={ref} className="sr-only">
        {text}
      </span>
      <span aria-hidden className="inline">
        {words.map((word, w) => {
          const units = type === "chars" ? word.split("") : [word];
          return (
            <span key={w} className="inline-block whitespace-nowrap">
              {units.map((unit, u) => {
                const i = unitIndex++;
                return (
                  <span
                    key={u}
                    className="inline-block overflow-hidden align-bottom"
                  >
                    <motion.span
                      className="inline-block will-change-transform"
                      custom={i}
                      variants={variants}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                    >
                      {unit}
                    </motion.span>
                  </span>
                );
              })}
              {w < words.length - 1 && <span className="inline">&nbsp;</span>}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
