"use client";

import { useEffect, useState } from "react";

/** True after first client mount - guards against hydration mismatch for client-only UI. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
