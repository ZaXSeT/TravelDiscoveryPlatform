"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, Wand2, Menu } from "lucide-react";
import { AuthNav } from "@/features/auth/components/auth-nav";
import { NavBar as TubelightNavBar } from "@/components/ui/tubelight-navbar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useUiStore } from "@/stores/use-ui-store";
import { routes } from "@/constants/routes";
import { siteConfig } from "@/constants/config";
import { cn } from "@/lib/utils";

import { Heart, Map, User } from "lucide-react";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";

const PUBLIC_NAV_ITEMS = [
  { name: "Explore", url: routes.explore, icon: Compass },
  { name: "Plan", url: routes.tripGenerator, icon: Wand2 },
  { name: "Journal", url: routes.journal, icon: BookOpen },
];

const AUTHED_NAV_ITEMS = [
  { name: "Wishlist", url: routes.wishlist, icon: Heart },
  { name: "Trips", url: routes.itineraries, icon: Map },
  { name: "Profile", url: routes.profile, icon: User },
];

export function Header() {
  const pathname = usePathname();
  const toggleMobile = useUiStore((s) => s.toggleMobileNav);
  const { user } = useAuthUser();
  const overHero =
    pathname === routes.home || pathname.startsWith("/destinations/");

  const items = user 
    ? [...PUBLIC_NAV_ITEMS, ...AUTHED_NAV_ITEMS] 
    : PUBLIC_NAV_ITEMS;

  return (
    <>
      <TubelightNavBar 
        items={items} 
        defaultDarkTheme={overHero}
        leftContent={
          <Link
            href={routes.home}
            className="font-display text-xl font-bold tracking-tight px-2"
          >
            {siteConfig.name}
          </Link>
        }
        rightContent={
          <div className="flex items-center gap-2">
            <div className="hidden md:block transition-colors duration-300">
              <AuthNav defaultDarkTheme={overHero} />
            </div>
            <button
              type="button"
              onClick={toggleMobile}
              aria-label="Open menu"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full transition-colors md:hidden hover:bg-foreground/5"
              )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        }
      />
      <MobileMenu links={items.map(item => ({ href: item.url, label: item.name }))} />
    </>
  );
}
