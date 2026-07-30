"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

/** Scroll-reveal wrapper. Renders static when the user prefers reduced motion. */
export function Reveal({
  children,
  className,
  variants = fadeUp,
  delay,
  as,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const reduced = useReducedMotion();
  const Comp = as === "section" ? motion.section : as === "li" ? motion.li : motion.div;
  if (reduced) {
    const Static = as ?? "div";
    return <Static className={className}>{children}</Static>;
  }
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </Comp>
  );
}

/** Parent that staggers its Reveal-variant children. */
export function RevealGroup({
  children,
  className,
  as,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Static = as ?? "div";
    return <Static className={className}>{children}</Static>;
  }
  const Comp = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  return (
    <Comp className={className} initial="hidden" whileInView="visible" viewport={viewportOnce} variants={staggerContainer}>
      {children}
    </Comp>
  );
}

/** Child item for RevealGroup. */
export function RevealItem({ children, className, as }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Static = as ?? "div";
    return <Static className={className}>{children}</Static>;
  }
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp className={className} variants={fadeUp}>
      {children}
    </Comp>
  );
}
