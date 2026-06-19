"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { AuthFormState } from "@/features/auth/actions";

export function FormStatus({ state }: { state: AuthFormState | null }) {
  if (!state?.error && !state?.notice) return null;
  const isError = Boolean(state.error);

  return (
    <div
      role={isError ? "alert" : "status"}
      className={
        "flex items-start gap-2 rounded-md border p-3 text-sm " +
        (isError
          ? "border-[rgba(180,35,24,0.3)] bg-[rgba(180,35,24,0.08)] text-destructive"
          : "border-[rgba(46,139,87,0.3)] bg-[rgba(46,139,87,0.08)] text-accent-green")
      }
    >
      {isError ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{state.error ?? state.notice}</span>
    </div>
  );
}
