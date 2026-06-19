import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export const metadata: Metadata = { title: "Set a new password" };

export default function UpdatePasswordPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Set a new password</h1>
      <p className="mt-2 text-muted-foreground">
        Choose a strong password you don&apos;t use elsewhere.
      </p>
      <div className="mt-8">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
