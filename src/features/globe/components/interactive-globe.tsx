"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CldImage } from "@/components/media/cld-image";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { preloaderStore } from "@/lib/store/preloader-store";

// Three.js is loaded only when the capability gate passes (so it never ships to mobile
// or low-end devices). ssr:false keeps it out of server render entirely.
const GlobeCanvas = dynamic(
  () => import("@/features/globe/components/globe-canvas"),
  { ssr: false },
);

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

interface InteractiveGlobeProps {
  fallbackImageId: string;
  alt: string;
}

export function InteractiveGlobe({ fallbackImageId, alt }: InteractiveGlobeProps) {
  const reduced = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    // The only hard requirement is a working WebGL context — no screen-width or perf-tier
    // gating, so the 3D globe shows on virtually every phone (design decision). Mobile still
    // gets a lighter render (lower DPR, fewer markers, no drag), and reduced-motion users get
    // the globe without auto-rotation (see GlobeCanvas).
    if (!webglAvailable()) {
      setEnabled(false);
      return;
    }
    setMobile(!window.matchMedia("(min-width: 1024px)").matches);
    // Delay mounting WebGL during initial load so it never freezes the preloader animation.
    if (!preloaderStore.hasRun) {
      const timer = setTimeout(() => setEnabled(true), 2000);
      return () => clearTimeout(timer);
    }
    setEnabled(true);
  }, []);

  if (enabled) {
    return (
      <div
        className="relative mx-auto aspect-square w-full max-w-xl"
        // Let vertical swipes scroll the page instead of being captured by the canvas.
        style={mobile ? { touchAction: "pan-y" } : undefined}
      >
        <GlobeCanvas mobile={mobile} reducedMotion={reduced} />
      </div>
    );
  }

  // Static fallback (only when WebGL is unavailable) - identical to the Phase 2/3 static
  // globe so nothing regresses.
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-full border border-white/10 bg-dark-0 shadow-card">
      <CldImage
        publicId={fallbackImageId}
        alt={alt}
        width={800}
        height={800}
        fill
        sizes="(max-width: 1024px) 80vw, 40vw"
        className="object-cover opacity-90"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow:
            "inset 0 0 80px rgba(200,169,126,0.25), 0 0 120px rgba(200,169,126,0.12)",
        }}
      />
    </div>
  );
}
