"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function MfaChallenge({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const f = data?.totp?.find((x) => x.status === "verified");
      if (!f) {
        router.replace(returnTo); // nothing to challenge
        return;
      }
      setFactorId(f.id);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setPending(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (chErr || !ch) {
      setPending(false);
      setError("Couldn't start the challenge. Please try again.");
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.id,
      code: code.trim(),
    });
    if (vErr) {
      setPending(false);
      setError("Invalid code — check your authenticator app and try again.");
      return;
    }
    router.replace(returnTo);
    router.refresh();
  };

  if (!ready) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Preparing…
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="mfa-code">6-digit code</Label>
        <Input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="text-lg tracking-[0.4em]"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full"
        disabled={pending || code.length !== 6}
      >
        {pending ? "Verifying…" : "Verify"}
      </Button>
    </form>
  );
}
