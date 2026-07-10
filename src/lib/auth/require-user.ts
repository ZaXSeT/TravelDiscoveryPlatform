import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getOptionalUser } from "@/lib/auth/session";
import { isMfaChallengeRequired } from "@/lib/auth/mfa";
import { routes } from "@/constants/routes";

// Page-level guard for protected routes (defense in depth alongside middleware).
// Redirects to sign-in when there's no session, and to the TOTP step if the account has 2FA
// but the current session is still at aal1.
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getOptionalUser();
  if (!user) {
    redirect(`${routes.signIn}?returnTo=${encodeURIComponent(returnTo)}`);
  }
  if (await isMfaChallengeRequired()) {
    redirect(`${routes.mfa}?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return user;
}
