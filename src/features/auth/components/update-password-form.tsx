"use client";

import { useActionState } from "react";
import {
  updatePasswordAction,
  type AuthFormState,
} from "@/features/auth/actions";
import { AuthField } from "@/features/auth/components/auth-field";
import { FormStatus } from "@/features/auth/components/form-status";
import { Button } from "@/components/ui/button";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<AuthFormState | null, FormData>(
    updatePasswordAction,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <FormStatus state={state} />
      <AuthField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        error={state?.fieldErrors?.password}
      />
      <AuthField
        id="confirm"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        error={state?.fieldErrors?.confirm}
      />
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
