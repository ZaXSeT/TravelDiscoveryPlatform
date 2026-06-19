"use client";

import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// Single source of truth for smooth scroll + GSAP ScrollTrigger sync
// (03_RENDERING_AND_DATA_ARCHITECTURE.md §4). Lenis/GSAP are dynamically imported so
// they stay out of the initial bundle, and the whole thing is disabled under
// prefers-reduced-motion (native scroll, no JS scroll work).
export function ScrollProvider() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let active = true;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [LenisMod, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (!active) return;

      const Lenis = LenisMod.default;
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [reduced]);

  return null;
}
