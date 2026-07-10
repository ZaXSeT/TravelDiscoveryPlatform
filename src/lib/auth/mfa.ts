import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// True when the signed-in user has a verified MFA factor but the current session is still at
// aal1 — i.e. they must complete a TOTP challenge before reaching protected pages.
export async function isMfaChallengeRequired(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) return false;
    return data.nextLevel === "aal2" && data.currentLevel !== "aal2";
  } catch {
    return false;
  }
}
