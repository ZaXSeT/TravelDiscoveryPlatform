"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";
import { cn } from "@/lib/utils";

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
        <Button onClick={signOut} variant="outline" size="lg" className="w-full">
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={signOut} variant="outline" size="sm" className="rounded-full transition-transform hover:scale-105 active:scale-95">
      Sign out
    </Button>
  );
}
