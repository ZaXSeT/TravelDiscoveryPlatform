"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";
import { cn } from "@/lib/utils";

const AUTHED_LINKS = [
  { href: routes.wishlist, label: "Wishlist" },
  { href: routes.itineraries, label: "Trips" },
  { href: routes.profile, label: "Profile" },
];

// Client island so marketing pages stay static while the nav still reflects auth state.
export function AuthNav({
  variant = "bar",
  onNavigate,
}: {
  variant?: "bar" | "menu";
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { user, ready } = useAuthUser();
  const isMenu = variant === "menu";

  if (!ready) {
    return <div className={cn(isMenu ? "h-11" : "h-9 w-20")} aria-hidden />;
  }

  if (!user) {
    return (
      <Button
        asChild
        variant={isMenu ? "default" : "gold"}
        size={isMenu ? "lg" : "sm"}
        className={cn(isMenu ? "w-full" : "", "rounded-full transition-transform hover:scale-105 active:scale-95")}
        onClick={onNavigate}
      >
        <Link href={routes.signIn}>Sign in</Link>
      </Button>
    );
  }

  const signOut = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    onNavigate?.();
    router.push(routes.home);
    router.refresh();
  };

  if (isMenu) {
    return (
      <div className="flex flex-col gap-2">
        {AUTHED_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className="rounded-md py-2 font-display text-2xl tracking-tight hover:text-accent-goldText"
          >
            {l.label}
          </Link>
        ))}
        <Button onClick={signOut} variant="outline" size="lg" className="mt-2 w-full">
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      {AUTHED_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="group relative text-[15px] font-medium transition-colors duration-300 opacity-90 hover:opacity-100"
        >
          <span className="relative z-10">{l.label}</span>
          <span className="absolute inset-x-0 -bottom-1.5 h-[2px] scale-x-0 bg-current transition-transform duration-300 ease-[0.22,1,0.36,1] origin-left group-hover:scale-x-100" />
        </Link>
      ))}
      <Button onClick={signOut} variant="outline" size="sm" className="ml-2 rounded-full transition-transform hover:scale-105 active:scale-95">
        Sign out
      </Button>
    </div>
  );
}
