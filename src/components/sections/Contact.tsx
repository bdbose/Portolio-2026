"use client";

import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import SplitText, { EASE } from "@/components/anim/SplitText";
import Reveal from "@/components/anim/Reveal";
import Magnetic from "@/components/anim/Magnetic";
import Parallax from "@/components/anim/Parallax";
import { profile } from "@/lib/data";

const links = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    external: false,
  },
  {
    label: "Phone",
    value: profile.phone,
    href: `tel:${profile.phone.replace(/\s+/g, "")}`,
    external: false,
  },
  {
    label: "LinkedIn",
    value: profile.linkedin.replace(/^https:\/\/(www\.)?/, ""),
    href: profile.linkedin,
    external: true,
  },
  {
    label: "GitHub",
    value: profile.github.replace(/^https:\/\/(www\.)?/, ""),
    href: profile.github,
    external: true,
  },
];

export default function Contact() {
  const lenis = useLenis();

  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-line pt-24 pb-10 md:pt-40"
    >
      {/* Accent radial glow rising from the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-40%] left-1/2 w-[80vw] -translate-x-1/2"
      >
        <Parallax speed={-0.4}>
          <motion.div
            className="aspect-square w-full rounded-full bg-accent/10 blur-[140px]"
            initial={{ scale: 0.6 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.8, ease: EASE }}
          />
        </Parallax>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 md:px-12 lg:px-20">
        {/* Label */}
        <Reveal y={24}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            / 06 — Contact
          </p>
        </Reveal>

        {/* Statement + CTA */}
        <div className="relative mt-10 md:mt-16">
          <h2 className="font-display text-[clamp(3rem,10vw,10rem)] font-bold uppercase leading-[0.9] text-foreground">
            <SplitText
              text="LET'S WORK"
              as="span"
              className="block"
              stagger={0.03}
            />
            <SplitText
              text="TOGETHER"
              as="span"
              className="text-stroke-accent block"
              stagger={0.03}
              delay={0.2}
            />
          </h2>

          <motion.div
            className="mt-12 lg:absolute lg:right-[8vw] lg:top-1/2 lg:mt-0 lg:-translate-y-1/2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.35 }}
          >
            <Magnetic strength={0.4} className="inline-block">
              <a
                href={`mailto:${profile.email}`}
                data-cursor="hover"
                aria-label={`Say hello — email ${profile.name}`}
                className="relative flex size-40 items-center justify-center rounded-full bg-accent font-display text-sm font-bold uppercase text-background transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(255,138,61,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:size-56 md:text-base"
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-2 rounded-full border border-dashed border-background/40 will-change-transform"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                />
                <span>Say hello&nbsp;↗</span>
              </a>
            </Magnetic>
          </motion.div>
        </div>

        {/* Links row */}
        <div className="mt-24 grid gap-6 border-t border-line pt-10 md:grid-cols-4">
          {links.map((link, i) => (
            <Reveal key={link.label} delay={i * 0.08} y={32}>
              <a
                href={link.href}
                data-cursor="hover"
                {...(link.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                aria-label={`${link.label}: ${link.value}`}
              >
                <span className="block font-mono text-xs uppercase tracking-[0.3em] text-muted transition-colors duration-300 group-hover:text-accent">
                  {link.label}
                </span>
                <span className="mt-2 block truncate text-sm text-foreground transition-colors duration-300 group-hover:text-accent md:text-base">
                  {link.value}
                  {link.external && (
                    <span aria-hidden className="ml-1 text-muted transition-colors duration-300 group-hover:text-accent">
                      ↗
                    </span>
                  )}
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span>© 2026 {profile.name}</span>
          <span>{profile.location}</span>
          <span>Built with Next.js + Framer Motion</span>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => lenis?.scrollTo(0, { duration: 1.6 })}
            className="uppercase tracking-[0.2em] transition-colors duration-300 hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Back to top ↑
          </button>
        </div>

        {/* Watermark */}
        <Reveal y={80} className="pointer-events-none mt-8 select-none">
          <div
            aria-hidden
            className="text-stroke text-center font-display text-[20vw] font-bold uppercase leading-none opacity-20"
          >
            BDBOSE
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
