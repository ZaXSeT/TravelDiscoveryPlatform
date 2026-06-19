import type { Metadata } from "next";
import { ResetForm } from "@/features/auth/components/reset-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Reset your password</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <div className="mt-8">
        <ResetForm />
      </div>
    </div>
  );
}
