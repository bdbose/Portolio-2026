"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import Marquee from "@/components/anim/Marquee";
import Reveal from "@/components/anim/Reveal";
import SectionHeading from "@/components/anim/SectionHeading";
import { EASE } from "@/components/anim/SplitText";
import { skills } from "@/lib/data";

const ITEM_CLASS =
  "font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold uppercase whitespace-nowrap";

function MarqueeItems({
  items,
  classForIndex,
}: {
  items: string[];
  classForIndex: (i: number) => string;
}) {
  return (
    <>
      {items.map((item, i) => (
        <Fragment key={item}>
          <span className={`${ITEM_CLASS} ${classForIndex(i)}`}>{item}</span>
          <span className="mx-6 text-accent" aria-hidden="true">
            ✦
          </span>
        </Fragment>
      ))}
    </>
  );
}

const categories = [
  { label: "Backend & Systems", items: skills.backend },
  { label: "Frontend & Web", items: skills.frontend },
  { label: "AI & Search", items: skills.ai },
  { label: "Infra & Cloud", items: skills.infra },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 md:py-40">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1600px]">
          <SectionHeading index="05" title="Skills" />
        </div>
      </div>

      {/* Full-bleed velocity-reactive marquee rows */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: EASE }}
      >
        <Marquee baseVelocity={2.5} className="py-4 md:py-6">
          <MarqueeItems
            items={skills.backend}
            classForIndex={() => "text-foreground"}
          />
        </Marquee>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        className="border-t border-line"
      >
        <Marquee baseVelocity={-2} className="py-4 md:py-6">
          <MarqueeItems
            items={skills.frontend}
            classForIndex={() => "text-stroke"}
          />
        </Marquee>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        className="border-t border-line"
      >
        <Marquee baseVelocity={-1.8} className="py-4 md:py-6">
          <MarqueeItems
            items={skills.ai}
            classForIndex={() => "text-accent"}
          />
        </Marquee>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: EASE, delay: 0.3 }}
        className="border-t border-line"
      >
        <Marquee baseVelocity={1.5} className="py-4 md:py-6">
          <MarqueeItems
            items={skills.infra}
            classForIndex={(i) =>
              i % 2 === 0 ? "text-foreground" : "text-muted"
            }
          />
        </Marquee>
      </motion.div>

      {/* Scannable category grid */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1600px]">
          <Reveal className="mt-20">
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <div key={category.label} className="bg-background p-8">
                  <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
                    {category.label}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {category.items.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
