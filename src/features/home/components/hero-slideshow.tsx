"use client";

import { useState, useEffect } from "react";
import { CldImage } from "@/components/media/cld-image";
import { Parallax } from "@/components/motion/parallax";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlideshowProps {
  images: { id: string; label: string }[];
  intervalMs?: number;
}

export function HeroSlideshow({ images, intervalMs = 6000 }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <Parallax 
      speed={0.15} 
      offset={["start start", "end start"]}
      startAtZero
      className="absolute inset-x-0 top-0 h-[115%]"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <CldImage
            publicId={images[currentIndex]?.id ?? ""}
            alt={images[currentIndex]?.label ?? ""}
            width={1920}
            height={1280}
            priority={currentIndex === 0} // Only eager load the first one
            sizes="100vw"
            className="object-cover h-full w-full"
          />
        </motion.div>
      </AnimatePresence>
    </Parallax>
  );
}
