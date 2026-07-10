import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth/session";
import { isMfaChallengeRequired } from "@/lib/auth/mfa";
import { safeReturnTo } from "@/lib/validation/common";
import { routes } from "@/constants/routes";
import { MfaChallenge } from "@/features/auth/components/mfa-challenge";

export const metadata: Metadata = { title: "Two-factor verification" };
export const dynamic = "force-dynamic";

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const user = await getOptionalUser();
  if (!user) redirect(routes.signIn);

  const { returnTo } = await searchParams;
  const dest = safeReturnTo(returnTo);

  // Session is already fully verified (aal2) — nothing to challenge.
  if (!(await isMfaChallengeRequired())) redirect(dest);

  return (
    <div>
      <h1 className="font-display text-3xl">Two-step verification</h1>
      <p className="mt-2 text-muted-foreground">
        Enter the 6-digit code from your authenticator app to finish signing in.
      </p>
      <div className="mt-8">
        <MfaChallenge returnTo={dest} />
      </div>
    </div>
  );
}
