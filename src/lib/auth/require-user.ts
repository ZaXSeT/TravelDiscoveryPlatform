import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getOptionalUser } from "@/lib/auth/session";
import { routes } from "@/constants/routes";

// Page-level guard for protected routes (defense in depth alongside middleware).
// Redirects to sign-in with a same-origin returnTo when there is no session.
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getOptionalUser();
  if (!user) {
    redirect(`${routes.signIn}?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return user;
}
