"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  resetRequestSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";
import { safeReturnTo } from "@/lib/validation/common";
import { rateLimit, clientRateKey } from "@/lib/rate-limit/limiter";
import { siteConfig } from "@/constants/config";

const TOO_MANY =
  "Too many attempts. Please wait a minute and try again.";

export interface AuthFormState {
  error?: string;
  notice?: string;
  fieldErrors?: Record<string, string>;
}

function firstErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs && msgs[0]) out[key] = msgs[0];
  }
  return out;
}

export async function signInAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  if (!(await rateLimit(await clientRateKey("auth-signin"), 8, 600))) {
    return { error: TOO_MANY };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Generic message, no user enumeration.
    return { error: "Invalid email or password." };
  }

  const dest = safeReturnTo(formData.get("returnTo")?.toString());
  redirect(`${dest}${dest.includes("?") ? "&" : "?"}welcome=back`);
}

export async function signUpAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  if (!(await rateLimit(await clientRateKey("auth-signup"), 5, 600))) {
    return { error: TOO_MANY };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${siteConfig.url}/auth/callback`,
    },
  });
  const ALREADY_REGISTERED =
    "An account with this email already exists. Try signing in instead.";

  if (error) {
    if (/already registered|already exists|already been registered/i.test(error.message)) {
      return { error: ALREADY_REGISTERED };
    }
    return { error: error.message };
  }

  // With email confirmation ON, Supabase hides duplicate emails (anti-enumeration) by
  // returning a "user" with no identities instead of an error. Treat that as taken.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return { error: ALREADY_REGISTERED };
  }

  // Email confirmation ON: no active session yet.
  if (!data.session) {
    return {
      notice:
        "Almost there. Check your email to confirm your account, then sign in.",
    };
  }

  // Instant sign-in: flag the destination so the client shows a welcome toast.
  const dest = safeReturnTo(formData.get("returnTo")?.toString());
  redirect(`${dest}${dest.includes("?") ? "&" : "?"}welcome=1`);
}

export async function resetRequestAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  if (!(await rateLimit(await clientRateKey("auth-reset"), 5, 600))) {
    return { error: TOO_MANY };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteConfig.url}/auth/update-password`,
  });

  // Neutral response regardless of whether the account exists.
  return {
    notice: "If an account exists for that email, we've sent a reset link.",
  };
}

export async function updatePasswordAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { fieldErrors: firstErrors(parsed.error.flatten().fieldErrors) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
