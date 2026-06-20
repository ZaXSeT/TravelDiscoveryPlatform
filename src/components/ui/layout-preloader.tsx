"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CldImage } from "@/components/media/cld-image";
import { preloaderStore } from "@/lib/store/preloader-store";

gsap.registerPlugin();

// Cloudinary image IDs from destinations
const PRELOADER_IMAGES = [
  { id: "go/destinations/tokyo/hero", label: "Tokyo" },
  { id: "go/destinations/bali/hero", label: "Bali" },
  { id: "go/destinations/paris/hero", label: "Paris" },
  { id: "go/destinations/switzerland/hero", label: "Switzerland" },
  { id: "go/destinations/new-york/hero", label: "New York" },
];

const MINIMUM_DISPLAY_MS = 2800;

export function LayoutPreloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const loadedCount = useRef(0);
  const startTime = useRef(Date.now());

  const onImageLoad = useCallback(() => {
    loadedCount.current += 1;
    setImagesLoaded(loadedCount.current);
  }, []);

  // Counter animation + exit sequence
  useGSAP(
    () => {
      if (!containerRef.current) return;

      const tl = gsap.timeline();

      // 1. Animate counter from 0 to 90
      const counter = { val: 0 };
      tl.to(counter, {
        val: 90,
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = `${Math.round(counter.val)}`;
          }
        },
      }, 0);

      // 1b. Animate counter from 90 to 100 slowly to hide Globe loading lag
      tl.to(counter, {
        val: 100,
        duration: 0.8,
        ease: "power1.out",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = `${Math.round(counter.val)}`;
          }
        },
      }, 2.0);

      // 2. Stagger reveal grid images
      tl.fromTo(
        ".preloader-img",
        { clipPath: "inset(100% 0 0 0)", scale: 1.3 },
        {
          clipPath: "inset(0% 0 0 0)",
          scale: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power4.out",
        },
        0.3 // Start at 0.3s
      );

      // 3. Animate brand name words
      tl.fromTo(
        ".preloader-word",
        { y: "120%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1,
          stagger: 0.08,
          ease: "power4.out",
        },
        0.5
      );

      // 4. Fade in tagline
      tl.fromTo(
        ".preloader-tagline",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        1.0
      );

      // 5. Progress bar fill to 90%
      tl.fromTo(
        ".preloader-bar-fill",
        { scaleX: 0 },
        {
          scaleX: 0.9,
          duration: 2.0,
          ease: "power2.inOut",
        },
        0
      );

      // 5b. Progress bar fill to 100%
      tl.to(
        ".preloader-bar-fill",
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power1.out",
        },
        2.0
      );

      // 6. Exit: zoom images, slide out overlay
      tl.to(
        ".preloader-img",
        {
          scale: 1.15,
          duration: 0.8,
          ease: "power2.in",
        },
        `>+0.2`
      );

      tl.to(
        ".preloader-grid",
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        },
        "<+0.3"
      );

      tl.to(
        ".preloader-content",
        {
          y: -60,
          opacity: 0,
          duration: 0.5,
          ease: "power3.in",
        },
        "<"
      );

      // 7. Slide the entire preloader up
      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
        onComplete: () => {
          preloaderStore.setHasRun(true);
          setIsVisible(false);
          document.body.style.overflow = "";
        },
      });
    },
    { scope: containerRef }
  );

  // Check if already played this session
  useEffect(() => {
    if (preloaderStore.hasRun) {
      setIsVisible(false);
    }
  }, []);

  // Lock scroll while visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0b]"
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          animation: "noise-animation 0.4s steps(6) infinite",
        }}
      />

      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_45%,rgba(200,169,126,0.07),transparent)]" />

      {/* Image grid (background) */}
      <div className="preloader-grid pointer-events-none absolute inset-0 grid grid-cols-5 gap-[2px] opacity-40">
        {PRELOADER_IMAGES.map((img, i) => (
          <div key={i} className="preloader-img relative overflow-hidden" style={{ clipPath: "inset(100% 0 0 0)" }}>
            <CldImage
              publicId={img.id}
              alt={img.label}
              width={400}
              height={600}
              sizes="20vw"
              className="h-full w-full object-cover"
              onLoad={onImageLoad}
            />
            <div className="absolute inset-0 bg-[#0a0a0b]/40" />
          </div>
        ))}
      </div>

      {/* Center content */}
      <div className="preloader-content relative z-10 flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="flex items-center overflow-hidden">
          {["O", "r", "b", "i", "s"].map((letter, i) => (
            <span
              key={i}
              className="preloader-word inline-block font-serif text-6xl tracking-tight text-white md:text-8xl"
              style={{ opacity: 0 }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="preloader-tagline text-[10px] font-light uppercase tracking-[0.5em] text-white/40 md:text-[12px]"
          style={{ opacity: 0 }}
        >
          Discover the world
        </p>

        {/* Progress */}
        <div className="flex flex-col items-center gap-4">
          {/* Progress bar */}
          <div className="relative h-[1px] w-40 overflow-hidden bg-white/10 md:w-56">
            <div
              className="preloader-bar-fill absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-[#c8a97e] to-white/60"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          {/* Counter */}
          <div className="flex items-baseline gap-1">
            <span
              ref={counterRef}
              className="font-mono text-xs tabular-nums tracking-[0.4em] text-white/30"
            >
              0
            </span>
            <span className="font-mono text-[8px] tracking-[0.4em] text-white/20">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Bottom decorative accent */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <div className="h-6 w-[1px] bg-gradient-to-b from-white/15 to-transparent" />
      </div>
    </div>
  );
}
