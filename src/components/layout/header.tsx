"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, Menu } from "lucide-react";
import { AuthNav } from "@/features/auth/components/auth-nav";
import { NavBar as TubelightNavBar } from "@/components/ui/tubelight-navbar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useUiStore } from "@/stores/use-ui-store";
import { routes } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Explore", url: routes.explore, icon: Compass },
  { name: "Journal", url: routes.journal, icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();
  const toggleMobile = useUiStore((s) => s.toggleMobileNav);
  const overHero =
    pathname === routes.home || pathname.startsWith("/destinations/");

  return (
    <>
      <TubelightNavBar 
        items={NAV_ITEMS} 
        leftContent={
          <Link
            href={routes.home}
            className={cn(
              "font-display text-xl font-bold tracking-tight px-2 transition-colors duration-300",
              !overHero ? "text-foreground" : "text-white"
            )}
          >
            {siteConfig.name}
          </Link>
        }
        rightContent={
          <div className="flex items-center gap-2">
            <div className={cn("hidden md:block transition-colors duration-300", !overHero ? "text-foreground" : "text-white")}>
              <AuthNav />
            </div>
            <button
              type="button"
              onClick={toggleMobile}
              aria-label="Open menu"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full transition-colors md:hidden",
                !overHero ? "text-foreground hover:bg-foreground/5" : "text-white hover:bg-white/10"
              )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        }
      />
      <MobileMenu links={NAV_ITEMS.map(item => ({ href: item.url, label: item.name }))} />
    </>
  );
}
