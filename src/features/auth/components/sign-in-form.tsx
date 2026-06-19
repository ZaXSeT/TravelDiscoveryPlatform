"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthFormState } from "@/features/auth/actions";
import { AuthField } from "@/features/auth/components/auth-field";
import { FormStatus } from "@/features/auth/components/form-status";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export function SignInForm({ returnTo }: { returnTo?: string }) {
  const [state, action, pending] = useActionState<AuthFormState | null, FormData>(
    signInAction,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <FormStatus state={state} />
      <input type="hidden" name="returnTo" value={returnTo ?? "/"} />

      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={state?.fieldErrors?.email}
      />
      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={state?.fieldErrors?.password}
      />

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <div className="space-y-1 text-center text-sm text-muted-foreground">
        <p>
          <Link
            href={routes.reset}
            className="font-medium text-accent-goldText hover:underline"
          >
            Forgot your password?
          </Link>
        </p>
        <p>
          New here?{" "}
          <Link
            href={routes.signUp}
            className="font-medium text-accent-goldText hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
