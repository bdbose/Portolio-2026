"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { useLenis } from "lenis/react";
import Magnetic from "@/components/anim/Magnetic";
import { EASE } from "@/components/anim/SplitText";
import { profile } from "@/lib/data";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Nav() {
  const lenis = useLenis();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) setHidden(true);
    else if (latest < previous) setHidden(false);
  });

  // Freeze smooth scrolling while the mobile overlay is open. Only touch
  // Lenis when the menu actually opens, so nothing is clobbered when this
  // effect first runs on mount.
  useEffect(() => {
    if (!menuOpen) return;
    lenis?.stop();
    return () => {
      lenis?.start();
    };
  }, [menuOpen, lenis]);

  // The slow intro transition only applies during the entrance animation;
  // afterwards scroll-driven hide/show must use the fast transition instead
  // of re-inheriting the entrance delay.
  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const goTo = (target: string | number) => {
    setMenuOpen(false);
    lenis?.start();
    lenis?.scrollTo(target, { offset: 0 });
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[90]"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden && !menuOpen ? -100 : 0, opacity: 1 }}
        transition={
          introDone
            ? { duration: 0.5, ease: EASE }
            : { duration: 0.8, delay: 0.2, ease: EASE }
        }
      >
        {/* Scroll progress hairline — kept outside the blend wrapper so the accent stays true */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-accent"
          style={{ scaleX: progress }}
        />

        <div className="mix-blend-difference">
          <div className="px-6 md:px-12 lg:px-20">
            <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between">
              {/* Logo */}
              <Magnetic strength={0.3}>
                <button
                  type="button"
                  data-cursor="hover"
                  aria-label="Scroll to top"
                  onClick={() => lenis?.scrollTo(0, { offset: 0 })}
                  className="font-display text-xl font-bold tracking-tight text-foreground transition-colors duration-300 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                >
                  BB&copy;
                </button>
              </Magnetic>

              {/* Desktop links */}
              <nav
                aria-label="Primary"
                className="hidden items-center gap-8 md:flex"
              >
                {LINKS.map((link) => (
                  <Magnetic key={link.href} strength={0.25}>
                    <a
                      href={link.href}
                      data-cursor="hover"
                      onClick={(e) => {
                        e.preventDefault();
                        goTo(link.href);
                      }}
                      className="group relative inline-block py-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground focus-visible:text-accent focus-visible:outline-none"
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      />
                    </a>
                  </Magnetic>
                ))}
              </nav>

              {/* Mobile menu trigger */}
              <button
                type="button"
                data-cursor="hover"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className="group relative py-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground focus-visible:text-accent focus-visible:outline-none md:hidden"
              >
                Menu
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile overlay — outside the blend wrapper */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[95] bg-surface md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="flex h-full flex-col px-6 pb-10 pt-0">
              {/* Overlay header */}
              <div className="flex h-20 items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
                  Menu
                </span>
                <button
                  type="button"
                  data-cursor="hover"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors duration-300 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                >
                  Close
                </button>
              </div>

              {/* Links */}
              <nav
                aria-label="Mobile"
                className="flex flex-1 flex-col justify-center gap-3"
              >
                {LINKS.map((link, i) => (
                  <div key={link.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "115%" }}
                      animate={{ y: "0%" }}
                      transition={{
                        duration: 0.8,
                        ease: EASE,
                        delay: 0.3 + i * 0.08,
                      }}
                    >
                      <a
                        href={link.href}
                        data-cursor="hover"
                        onClick={(e) => {
                          e.preventDefault();
                          goTo(link.href);
                        }}
                        className="flex items-baseline gap-4 font-display text-[clamp(2.5rem,11vw,3rem)] font-bold uppercase leading-[1.05] tracking-tight text-foreground transition-colors duration-300 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                      >
                        <span
                          aria-hidden
                          className="font-mono text-xs font-normal tracking-[0.3em] text-accent"
                        >
                          0{i + 1}
                        </span>
                        {link.label}
                      </a>
                    </motion.div>
                  </div>
                ))}
              </nav>

              {/* Overlay footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.75 }}
                className="flex flex-col gap-2 border-t border-line pt-6"
              >
                <a
                  href={`mailto:${profile.email}`}
                  data-cursor="hover"
                  className="font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                >
                  {profile.email}
                </a>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  {profile.location}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
