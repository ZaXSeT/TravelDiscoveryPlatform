"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetRequestAction, type AuthFormState } from "@/features/auth/actions";
import { AuthField } from "@/features/auth/components/auth-field";
import { FormStatus } from "@/features/auth/components/form-status";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthFormState | null, FormData>(
    resetRequestAction,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <FormStatus state={state} />
      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={state?.fieldErrors?.email}
      />
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={routes.signIn}
          className="font-medium text-accent-goldText hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
