import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth/session";
import { safeReturnTo } from "@/lib/validation/common";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const dest = safeReturnTo(returnTo);
  const user = await getOptionalUser();
  if (user) redirect(dest);

  return (
    <div>
      <h1 className="font-display text-3xl">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">
        Sign in to save destinations and plan trips.
      </p>
      <div className="mt-8">
        <SignInForm returnTo={dest} />
      </div>
    </div>
  );
}
