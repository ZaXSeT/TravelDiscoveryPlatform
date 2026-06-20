"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface ParallaxProps {
  children: React.ReactNode;
  /** Fraction of element height to drift across the viewport (0–0.5 is tasteful). */
  speed?: number;
  className?: string;
  /** Framer motion useScroll offset. Default is ["start end", "end start"] */
  offset?: any;
  /** If true, parallax starts at 0% translateY instead of -speed%. Ideal for Hero sections. */
  startAtZero?: boolean;
}

export function Parallax({ children, speed = 0.15, className, offset = ["start end", "end start"], startAtZero = false }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Track scroll position relative to the element's position in the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset,
  });

  // Map 0 -> 1 scroll progress to -speed% -> speed% translation (or 0 -> speed% if startAtZero)
  const percentage = speed * 100;
  const yRange = startAtZero ? ["0%", `${percentage}%`] : [`-${percentage}%`, `${percentage}%`];
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : yRange
  );

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  );
}
