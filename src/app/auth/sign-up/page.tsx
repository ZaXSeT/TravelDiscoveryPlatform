import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth/session";
import { safeReturnTo } from "@/lib/validation/common";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({
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
      <h1 className="font-display text-3xl">Create your account</h1>
      <p className="mt-2 text-muted-foreground">
        Save favorites, build itineraries, and keep a travel journal.
      </p>
      <div className="mt-8">
        <SignUpForm returnTo={dest} />
      </div>
    </div>
  );
}
