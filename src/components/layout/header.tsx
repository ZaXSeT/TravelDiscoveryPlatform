"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AuthNav } from "@/features/auth/components/auth-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useUiStore } from "@/stores/use-ui-store";
import { routes } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import { cn } from "@/lib/utils";

// Phase 2 nav links only point to pages that exist (no broken navigation).
// Journal / Trip Generator are added with their phases.
const NAV_LINKS = [
  { href: routes.explore, label: "Explore" },
  { href: routes.journal, label: "Journal" },
];

export function Header() {
  const pathname = usePathname();
  const overHero =
    pathname === routes.home || pathname.startsWith("/destinations/");
  const [scrolled, setScrolled] = useState(false);
  const toggleMobile = useUiStore((s) => s.toggleMobileNav);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overHero;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "border-b border-border bg-background text-foreground shadow-soft backdrop-blur-md"
          : "border-b border-transparent bg-transparent text-white",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:h-20 md:px-6 lg:px-12"
      >
        <Link
          href={routes.home}
          className="font-display text-xl font-semibold tracking-tight"
        >
          {siteConfig.name}
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm font-medium opacity-90 transition-opacity hover:opacity-100"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <AuthNav />
        </div>

        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open menu"
          className="inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 lg:hidden"
        >
          <Menu className="size-6" />
        </button>
      </nav>

      <MobileMenu links={NAV_LINKS} />
    </header>
  );
}
