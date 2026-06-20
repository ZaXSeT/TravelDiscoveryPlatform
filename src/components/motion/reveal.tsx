"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { preloaderStore } from "@/lib/store/preloader-store";

// Lightweight CSS reveal (no animation library - those arrive in Phase 4).
// Honors prefers-reduced-motion by rendering content immediately.
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  waitForPreloader?: boolean;
}

export function Reveal({ children, className, delayMs = 0, waitForPreloader = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }

    const baseDelay = 
      waitForPreloader && !preloaderStore.hasRun
        ? 3800 
        : 0;

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          // Delay marking as shown to stagger alongside hero title
          setTimeout(() => {
            setShown(true);
          }, baseDelay);
          
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, waitForPreloader]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delayMs}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-entrance motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
