"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
