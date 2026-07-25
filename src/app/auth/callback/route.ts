import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeReturnTo } from "@/lib/validation/common";
import { routes } from "@/constants/routes";

const OTP_TYPES: ReadonlySet<string> = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

// Establishes the session behind an auth link, then drops the user where they belong —
// already signed in, so email confirmation never ends at a login form.
//
// Two token shapes are accepted:
//   token_hash — email links. Verified server-side, so it works in *any* browser: the
//                recipient can open the mail on their phone after signing up on a laptop.
//   code       — PKCE/OAuth. Requires the code-verifier cookie set at sign-up, so it only
//                resolves in the originating browser. Kept for the OAuth callback.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = request.nextUrl.origin;
  const next = safeReturnTo(params.get("next"));
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const code = params.get("code");

  if (tokenHash || code) {
    const supabase = await createSupabaseServerClient();

    const { error } =
      tokenHash && type && OTP_TYPES.has(type)
        ? await supabase.auth.verifyOtp({
            type: type as EmailOtpType,
            token_hash: tokenHash,
          })
        : code
          ? await supabase.auth.exchangeCodeForSession(code)
          : { error: new Error("Unsupported auth link.") };

    if (!error) {
      // A recovery link grants a session purely so the password can be changed — send it to
      // the form rather than into the app.
      if (type === "recovery") {
        return NextResponse.redirect(new URL(routes.updatePassword, origin));
      }
      const dest = new URL(next, origin);
      dest.searchParams.set("welcome", "1");
      return NextResponse.redirect(dest);
    }
  }

  // Expired, already-used, or malformed link — say so instead of a bare login screen.
  const signIn = new URL(routes.signIn, origin);
  signIn.searchParams.set("notice", "link-invalid");
  if (next !== "/") signIn.searchParams.set("returnTo", next);
  return NextResponse.redirect(signIn);
}
