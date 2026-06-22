"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

// One-time welcome toast after sign-up (signUpAction redirects with ?welcome=1). Fires
// after the intro preloader (~3.8s) so it isn't hidden behind it, and strips the param via
// the History API (not router.replace, which would re-render and cancel the timer).
export function WelcomeToast() {
  const params = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    const w = params.get("welcome");
    if (fired.current || !w) return;
    fired.current = true;

    const message =
      w === "back"
        ? "Welcome back!"
        : "Welcome to Orbis! Your account is ready.";
    const timer = setTimeout(() => {
      toast.success(message);
    }, 4200);

    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search,
    );

    return () => clearTimeout(timer);
  }, [params]);

  return null;
}
