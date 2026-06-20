"use client"

import React, { useEffect, useState } from "react"
import { motion, useAnimation, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { preloaderStore } from "@/lib/store/preloader-store"

import { usePathname } from "next/navigation"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  defaultDarkTheme?: boolean
}

export const NavbarThemeContext = React.createContext(false);

// Module-level flag so the entrance animation only plays once per session,
// not on every client-side navigation.
let hasAnimated = false;

export function NavBar({ items, className, leftContent, rightContent, defaultDarkTheme = false }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const wrapperControls = useAnimation()
  const navRef = React.useRef<HTMLDivElement>(null)
  
  
  // Track if the navbar is currently over a dark section
  const [isOverDark, setIsOverDark] = useState(defaultDarkTheme)

  useEffect(() => {
    // Immediately sync with the new page's theme on navigation
    setIsOverDark(defaultDarkTheme);

    const checkOverlap = () => {
      if (!navRef.current) return;
      
      // If we are at the top of the page, strictly trust the default theme for this route.
      // This bypasses bounding-box math bugs during initial page load/animations.
      if (window.scrollY < 10) {
        setIsOverDark(defaultDarkTheme);
        return;
      }

      const darkSections = document.querySelectorAll('[data-theme="dark"]');
      
      // If no dark sections exist on the page (or haven't mounted yet),
      // we fallback to the page's default theme expectation.
      if (darkSections.length === 0) {
        setIsOverDark(defaultDarkTheme);
        return;
      }

      const navRect = navRef.current.getBoundingClientRect();
      let overDark = false;
      
      for (const section of darkSections) {
        const rect = section.getBoundingClientRect();
        const navCenter = navRect.top + navRect.height / 2;
        // 120px tolerance accounts for the initial y: -100 fly-in animation
        const tolerance = 120; 
        if (
          navCenter < rect.bottom + tolerance &&
          navCenter > rect.top - tolerance
        ) {
          overDark = true;
          break;
        }
      }
      setIsOverDark(overDark);
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkOverlap();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Wait for new page DOM to render before checking
    setTimeout(checkOverlap, 50);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, defaultDarkTheme]);

  const useWhiteText = isOverDark;

  useEffect(() => {
    if (hasAnimated) {
      // Already visible from a previous mount — snap to final state immediately
      wrapperControls.set({ opacity: 1, y: 0 })
      return
    }

    const hasPreloaded = preloaderStore.hasRun
    const baseDelay = hasPreloaded ? 0.2 : 4.4

    wrapperControls.start({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: baseDelay }
    }).then(() => {
      hasAnimated = true
    })
  }, [wrapperControls])

  useEffect(() => {
    // Sync active tab with current URL
    const match = items.find(item => 
      pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url + '/'))
    )
    if (match) {
      setActiveTab(match.name)
    } else {
      setActiveTab("") // Clear if not on a known nav item
    }
  }, [pathname, items])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <NavbarThemeContext.Provider value={useWhiteText}>
      <div
        className={cn(
          "fixed bottom-0 sm:bottom-auto sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 w-full sm:w-auto px-4 sm:px-0 pointer-events-none transition-colors duration-500",
          className,
        )}
      >
        <motion.div 
          ref={navRef}
          initial={{ opacity: 0, y: -100 }}
          animate={wrapperControls}
          className={cn(
            "flex items-center justify-between sm:justify-center gap-2 sm:gap-6 backdrop-blur-xl py-1.5 px-2 sm:px-4 rounded-full shadow-lg pointer-events-auto transition-all duration-500",
            useWhiteText 
              ? "bg-black/20 border border-white/10" 
              : "bg-white/70 border border-black/5"
          )}
        >
          {leftContent && (
            <div className={cn(
              "flex items-center flex-shrink-0 transition-colors duration-500",
              useWhiteText ? "text-white" : "text-foreground"
            )}>
              {leftContent}
            </div>
          )}
          
          <div className="flex items-center gap-1 sm:gap-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={item.url}
                      onClick={() => setActiveTab(item.name)}
                      className={cn(
                        "relative cursor-pointer text-sm font-semibold px-4 sm:px-6 py-2 rounded-full transition-all duration-500 flex-shrink-0 block",
                        !useWhiteText 
                          ? "text-foreground/80 hover:text-primary" 
                          : "text-white/80 hover:text-white",
                        isActive && (!useWhiteText ? "bg-muted text-primary" : "bg-white/20 text-white"),
                      )}
                    >
                      <span className="hidden md:inline">{item.name}</span>
                      <span className="md:hidden">
                        <Icon size={18} strokeWidth={2.5} />
                      </span>
                      {isActive && (
                        <motion.div
                          className={cn(
                            "absolute inset-0 w-full rounded-full -z-10 transition-colors duration-500",
                            !useWhiteText ? "bg-primary/5" : "bg-white/10"
                          )}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                            <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                            <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                            <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                          </div>
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {rightContent && (
            <div className={cn(
              "flex items-center flex-shrink-0 transition-colors duration-500",
              useWhiteText ? "text-white" : "text-foreground"
            )}>
              {rightContent}
            </div>
          )}
        </motion.div>
      </div>
    </NavbarThemeContext.Provider>
  )
}
