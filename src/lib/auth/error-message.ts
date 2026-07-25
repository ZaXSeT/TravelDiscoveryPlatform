import "server-only";
import type { AuthError } from "@supabase/supabase-js";

// Supabase's raw error text is written for developers, not end users: a paused project
// surfaces undici's bare "fetch failed", and a spent email quota surfaces "email rate limit
// exceeded". Both are meaningless to someone trying to register. Map the codes we can act on
// and swallow the rest behind a generic line, keeping the original in the server log.
const MESSAGES: Record<string, string> = {
  over_email_send_rate_limit:
    "We couldn't send the confirmation email — too many have been sent recently. Please try again in about an hour.",
  over_request_rate_limit:
    "Too many attempts. Please wait a moment and try again.",
  email_address_invalid:
    "That email address looks invalid. Please check it and try again.",
  email_provider_disabled:
    "Email sign-up is currently unavailable. Please try again later.",
  signup_disabled: "New sign-ups are currently disabled.",
  weak_password:
    "That password is too weak. Use at least 8 characters, including a letter and a number.",
  same_password: "That is already your current password. Choose a new one.",
};

const FALLBACK =
  "Something went wrong on our end. Please try again in a moment.";

export function authErrorMessage(error: AuthError, context: string): string {
  const known = error.code ? MESSAGES[error.code] : undefined;
  if (!known) {
    console.error(
      `[auth:${context}] ${error.code ?? "no-code"} (status ${error.status ?? "?"}): ${error.message}`,
    );
  }
  return known ?? FALLBACK;
}
