"use client"

import React, { useEffect, useState } from "react"
import { motion, useAnimation, useScroll, useMotionValueEvent } from "framer-motion"
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

export function NavBar({ items, className, leftContent, rightContent, defaultDarkTheme = false }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const wrapperControls = useAnimation()
  const navRef = React.useRef<HTMLDivElement>(null)
  
  // Track if the navbar is currently over a dark section
  const [isOverDark, setIsOverDark] = useState(defaultDarkTheme)

  useEffect(() => {
    const checkOverlap = () => {
      if (!navRef.current) return;
      const navRect = navRef.current.getBoundingClientRect();
      const darkSections = document.querySelectorAll('[data-theme="dark"]');
      let overDark = false;
      
      for (const section of darkSections) {
        const rect = section.getBoundingClientRect();
        // Check if navbar intersects this section vertically
        // Give a little padding so it doesn't switch too early
        if (
          navRect.top + navRect.height / 2 < rect.bottom &&
          navRect.bottom - navRect.height / 2 > rect.top
        ) {
          overDark = true;
          break;
        }
      }
      setIsOverDark(overDark);
    };

    // Use requestAnimationFrame for smooth checking
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
    // Initial check
    // Wait a tick for layout to complete
    setTimeout(checkOverlap, 100);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const useWhiteText = isOverDark;

  useEffect(() => {
    const hasPreloaded = preloaderStore.hasRun
    const baseDelay = hasPreloaded ? 0.2 : 4.4

    wrapperControls.start({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20, delay: baseDelay }
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
          initial={{ opacity: 0, y: -40 }}
          animate={wrapperControls}
          className={cn(
            "flex items-center justify-between sm:justify-center gap-2 sm:gap-6 backdrop-blur-lg py-1.5 px-2 sm:px-4 rounded-full shadow-lg pointer-events-auto transition-colors duration-500",
            "bg-background/5 border border-border/10"
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
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <Link
                    key={item.name}
                    href={item.url}
                    onClick={() => setActiveTab(item.name)}
                    className={cn(
                      "relative cursor-pointer text-sm font-semibold px-4 sm:px-6 py-2 rounded-full transition-all duration-500 flex-shrink-0",
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
                        layoutId="lamp"
                        className={cn(
                          "absolute inset-0 w-full rounded-full -z-10 transition-colors duration-500",
                          !useWhiteText ? "bg-primary/5" : "bg-white/10"
                        )}
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                          <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                          <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                          <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                        </div>
                      </motion.div>
                    )}
                  </Link>
                )
              })}
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
