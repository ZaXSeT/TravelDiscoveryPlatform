"use client";

import Link from "next/link";
import { routes } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import Image from "next/image";
import { LocalTime } from "@/components/ui/local-time";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });
  
  // As the footer scrolls into view, move the background image down slightly
  // to create a slower scrolling parallax effect.
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

  return (
    <footer ref={containerRef} className="relative flex flex-col min-h-[90svh] md:min-h-[95svh] overflow-hidden bg-dark-0 text-white mt-auto">
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0 h-[120%] -top-[20%] w-full">
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2560&auto=format&fit=crop"
          alt="Orbis Footer Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Scrim to make text readable */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col justify-between pt-16 md:pt-24">
        {/* Top section: Columns */}
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:gap-24 px-6 md:px-12 lg:px-24">
          
          {/* MENU */}
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-sm uppercase tracking-widest text-white/50 font-medium">Menu</h3>
            <nav className="flex flex-col gap-4 text-base md:text-lg font-light">
              <Link href={routes.home} className="hover:text-accent-goldText transition-colors">Home</Link>
              <Link href={routes.explore} className="hover:text-accent-goldText transition-colors">Explore</Link>
              <Link href={routes.journal} className="hover:text-accent-goldText transition-colors">Journal</Link>
              <Link href={routes.signIn} className="hover:text-accent-goldText transition-colors">Sign in</Link>
            </nav>
          </div>

          {/* SOCIALS */}
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-sm uppercase tracking-widest text-white/50 font-medium">Socials</h3>
            <div className="flex flex-col gap-4 text-base md:text-lg font-light">
              <a href="#" className="hover:text-accent-goldText transition-colors">Instagram</a>
              <a href="#" className="hover:text-accent-goldText transition-colors">TikTok</a>
              <a href="#" className="hover:text-accent-goldText transition-colors">Twitter</a>
            </div>
          </div>

          {/* LOCATION */}
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-sm uppercase tracking-widest text-white/50 font-medium">Location</h3>
            <div className="flex flex-col gap-4 text-base md:text-lg font-light">
              <p>Tokyo, Japan</p>
              <LocalTime />
            </div>
          </div>

          {/* ACCREDITATIONS (Right aligned on desktop) */}
          <div className="flex flex-col md:items-end justify-start gap-2 text-sm text-white/50 font-light mt-8 md:mt-0">
            <p>IATA Agent: 8622194</p>
            <p>DMCC License: 900695</p>
            <p>DCAA Accredited</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-24 flex flex-col">
          
          {/* Legal Bar */}
          <div className="flex flex-col items-center justify-between gap-4 pb-12 text-xs md:text-sm text-white/60 md:flex-row font-light px-6 md:px-12 lg:px-24">
            <p>© {new Date().getFullYear()} {siteConfig.name}, a Panathon company</p>
            <p className="hidden md:block">All Rights Reserved</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            </div>
          </div>

          {/* HUGE TEXT */}
          <div className="flex w-full justify-between items-end overflow-hidden pointer-events-none select-none">
            {"ORBIS".split("").map((char, i) => (
              <span key={i} className="text-[22vw] leading-[0.72] font-serif font-normal text-white translate-y-[8%]">
                {char}
              </span>
            ))}
          </div>
          
        </div>
      </div>
    </footer>
  );
}
