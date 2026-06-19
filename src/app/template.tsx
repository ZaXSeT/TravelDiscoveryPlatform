"use client";

import { motion, useReducedMotion } from "framer-motion";

// template.tsx re-mounts on every navigation, giving a subtle enter transition per route
// (Framer Motion is used for transitions/hover only; scroll motion is GSAP's domain).
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
