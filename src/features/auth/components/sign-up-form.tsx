"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthFormState } from "@/features/auth/actions";
import { AuthField } from "@/features/auth/components/auth-field";
import { FormStatus } from "@/features/auth/components/form-status";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export function SignUpForm({ returnTo }: { returnTo?: string }) {
  const [state, action, pending] = useActionState<AuthFormState | null, FormData>(
    signUpAction,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <FormStatus state={state} />
      <input type="hidden" name="returnTo" value={returnTo ?? "/"} />

      <AuthField
        id="displayName"
        label="Name"
        type="text"
        autoComplete="name"
        required
        error={state?.fieldErrors?.displayName}
      />
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
        autoComplete="new-password"
        required
        error={state?.fieldErrors?.password}
      />
      <p className="text-xs text-muted-foreground">
        At least 8 characters, including a letter and a number.
      </p>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={routes.signIn}
          className="font-medium text-accent-goldText hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
