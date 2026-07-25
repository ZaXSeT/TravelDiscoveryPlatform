import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth/session";
import { safeReturnTo } from "@/lib/validation/common";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { FormStatus } from "@/features/auth/components/form-status";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; notice?: string }>;
}) {
  const { returnTo, notice } = await searchParams;
  const dest = safeReturnTo(returnTo);
  const user = await getOptionalUser();
  if (user) redirect(dest);

  return (
    <div>
      <h1 className="font-display text-3xl">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">
        Sign in to save destinations and plan trips.
      </p>
      <div className="mt-8 space-y-5">
        {notice === "link-invalid" && (
          <FormStatus
            state={{
              error:
                "That confirmation link has expired or was already used. Sign in below, or sign up again to get a new one.",
            }}
          />
        )}
        <SignInForm returnTo={dest} />
      </div>
    </div>
  );
}
