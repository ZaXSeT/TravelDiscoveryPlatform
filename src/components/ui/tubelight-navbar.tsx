"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

export function NavBar({ items, className, leftContent, rightContent }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)

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
    <div
      className={cn(
        "fixed bottom-0 sm:bottom-auto sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 w-full sm:w-auto px-4 sm:px-0 pointer-events-none",
        className,
      )}
    >
      <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-6 bg-background/5 border border-border backdrop-blur-lg py-1.5 px-2 sm:px-4 rounded-full shadow-lg w-full max-w-4xl pointer-events-auto">
        {leftContent && (
          <div className="flex items-center flex-shrink-0">
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
                  "relative cursor-pointer text-sm font-semibold px-4 sm:px-6 py-2 rounded-full transition-colors",
                  "text-foreground/80 hover:text-primary",
                  isActive && "bg-muted text-primary",
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
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
          <div className="flex items-center flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  )
}
