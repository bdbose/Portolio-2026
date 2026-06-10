"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { EASE } from "./SplitText";

type CounterProps = {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
};

/** Counts from 0 to `value` when scrolled into view. */
export default function Counter({
  value,
  suffix = "",
  className,
  duration = 1.6,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, {
        duration,
        ease: EASE,
      });
      return controls.stop;
    }
  }, [inView, count, value, duration]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
