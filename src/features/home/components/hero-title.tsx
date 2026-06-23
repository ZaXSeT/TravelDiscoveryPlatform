"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { preloaderStore } from "@/lib/store/preloader-store";

export function HeroTitle() {
  const line1 = ["Places", "worth"];
  const line2 = ["the", "journey."];
  const controls = useAnimation();

  // The quintessential "Awwwards" premium ease (easeInOutQuart variant).
  // Extremely snappy initial acceleration with a very long, buttery smooth tail.
  const premiumEase = [0.76, 0, 0.24, 1];

  useEffect(() => {
    // If preloader hasn't run yet this session, it will take ~3.8s to finish.
    const hasPreloaded = preloaderStore.hasRun;
    const baseDelay = hasPreloaded ? 0.2 : 3.8;

    controls.start((i) => ({
      y: 0,
      transition: {
        delay: i * 0.12 + baseDelay, // Fast, overlapping stagger (0.12s per word)
        duration: 1.0,
        ease: premiumEase,
      },
    }));
  }, [controls]);

  return (
    <h1 className="font-serif text-[18vw] leading-[0.85] tracking-tight md:text-[10vw] lg:text-[8vw] xl:text-[7vw] 2xl:text-[120px] flex flex-col gap-2">
      <span className="flex flex-wrap gap-x-[3vw] md:gap-x-[2vw]">
        {line1.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.4em] -mb-[0.4em] pt-[0.2em] -mt-[0.2em] px-[0.2em] -mx-[0.2em]">
            <motion.span
              custom={i}
              initial={{ y: "150%" }}
              animate={controls}
              className="inline-block"
              style={{ willChange: "transform", WebkitFontSmoothing: "antialiased" }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
      <span className="flex flex-wrap gap-x-[3vw] md:gap-x-[2vw]">
        {line2.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.4em] -mb-[0.4em] pt-[0.2em] -mt-[0.2em] px-[0.2em] -mx-[0.2em]">
            <motion.span
              custom={i + line1.length}
              initial={{ y: "150%" }}
              animate={controls}
              className="inline-block italic text-white/90"
              style={{ willChange: "transform", WebkitFontSmoothing: "antialiased" }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </h1>
  );
}
