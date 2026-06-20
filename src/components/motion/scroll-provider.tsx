"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// Single source of truth for smooth scroll + GSAP ScrollTrigger sync
// (03_RENDERING_AND_DATA_ARCHITECTURE.md §4). Lenis/GSAP are dynamically imported so
// they stay out of the initial bundle, and the whole thing is disabled under
// prefers-reduced-motion (native scroll, no JS scroll work).
export function ScrollProvider() {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();
  const lenisRef = useRef<any>(null);

  // 1. Reset scroll position on route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // 2. Initialize Lenis and GSAP globally exactly once
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
      lenisRef.current = lenis;

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // Intercept anchor links for smooth scrolling via Lenis
      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest("a");
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        if (href?.startsWith("#") && href.length > 1) {
          e.preventDefault();
          e.stopPropagation();
          lenis.scrollTo(href);
        }
      };
      document.addEventListener("click", handleAnchorClick, { capture: true });

      cleanup = () => {
        document.removeEventListener("click", handleAnchorClick, { capture: true });
        gsap.ticker.remove(raf);
        lenis.destroy();
        lenisRef.current = null;
      };
    })();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [reduced]);

  return null;
}
