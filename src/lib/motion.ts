import type { Variants, Transition } from "framer-motion";

export const easeOutQuart = [0.25, 1, 0.5, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 26 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutQuart } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: easeOutQuart } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: easeOutQuart } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const viewportOnce = { once: true, margin: "-80px" } as const;
