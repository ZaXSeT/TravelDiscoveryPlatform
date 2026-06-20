"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthField } from "@/features/auth/components/auth-field";
import { Button } from "@/components/ui/button";
import { useAuthGate } from "@/stores/use-auth-gate";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/browser";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";
import { routes } from "@/constants/routes";

type Mode = "sign-in" | "sign-up";

// Mounted once globally. Performs client-side auth (so the page never navigates away)
// and replays the pending action via onAuthed.
export function AuthGate() {
  const router = useRouter();
  const { open, title, description, onAuthed, close } = useAuthGate();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setError(null);
    setNotice(null);
    setFieldErrors({});
  };

  async function handleSubmit(formData: FormData) {
    reset();
    if (!isSupabaseConfigured) {
      setError("Authentication is not configured in this environment.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    setPending(true);
    try {
      if (mode === "sign-up") {
        const parsed = signUpSchema.safeParse({
          email: formData.get("email"),
          password: formData.get("password"),
          displayName: formData.get("displayName"),
        });
        if (!parsed.success) {
          setFieldErrors(flatten(parsed.error.flatten().fieldErrors));
          return;
        }
        const { data, error: err } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { data: { display_name: parsed.data.displayName } },
        });
        if (err) return setError(err.message);
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("sign-in");
          return;
        }
      } else {
        const parsed = signInSchema.safeParse({
          email: formData.get("email"),
          password: formData.get("password"),
        });
        if (!parsed.success) {
          setFieldErrors(flatten(parsed.error.flatten().fieldErrors));
          return;
        }
        const { error: err } = await supabase.auth.signInWithPassword(parsed.data);
        if (err) return setError("Invalid email or password.");
      }

      // Authed - replay the pending action, then sync server components.
      const cb = onAuthed;
      close();
      await cb?.();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          close();
        }
      }}
    >
      <DialogContent className="left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg p-6">
        <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
        <DialogDescription className="mt-1 text-muted-foreground">
          {description ||
            (mode === "sign-in"
              ? "Sign in to save and plan."
              : "Create a free account to save and plan.")}
        </DialogDescription>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-[rgba(180,35,24,0.3)] bg-[rgba(180,35,24,0.08)] p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mt-4 rounded-md border border-[rgba(46,139,87,0.3)] bg-[rgba(46,139,87,0.08)] p-3 text-sm text-accent-green"
          >
            {notice}
          </p>
        )}

        <form action={handleSubmit} className="mt-5 space-y-4">
          {mode === "sign-up" && (
            <AuthField
              id="displayName"
              label="Name"
              type="text"
              autoComplete="name"
              required
              error={fieldErrors.displayName}
            />
          )}
          <AuthField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            error={fieldErrors.email}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            required
            error={fieldErrors.password}
          />
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending
              ? "Please wait…"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "sign-in" ? (
            <button
              type="button"
              onClick={() => {
                reset();
                setMode("sign-up");
              }}
              className="font-medium text-accent-goldText hover:underline"
            >
              New here? Create an account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                reset();
                setMode("sign-in");
              }}
              className="font-medium text-accent-goldText hover:underline"
            >
              Already have an account? Sign in
            </button>
          )}
          <p className="mt-1">
            <a href={routes.signIn} className="hover:underline">
              Open full sign-in page
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function flatten(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fieldErrors)) {
    if (v && v[0]) out[k] = v[0];
  }
  return out;
}
