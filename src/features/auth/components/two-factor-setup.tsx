"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Enroll = { factorId: string; qr: string; secret: string };

export function TwoFactorSetup() {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setEnabled(data?.totp?.some((f) => f.status === "verified") ?? false);
    setLoading(false);
  };
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEnroll = async () => {
    setError(null);
    setPending(true);
    // Clear any leftover unverified factors so a fresh enrol never collides.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.status === "unverified")
        await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error: err } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });
    setPending(false);
    if (err || !data || data.type !== "totp") {
      setError(err?.message ?? "Couldn't start 2FA setup.");
      return;
    }
    setEnroll({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setCode("");
  };

  const verify = async () => {
    if (!enroll) return;
    setError(null);
    setPending(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
      factorId: enroll.factorId,
    });
    if (chErr || !ch) {
      setPending(false);
      setError("Couldn't reach the authenticator. Please try again.");
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: ch.id,
      code: code.trim(),
    });
    setPending(false);
    if (vErr) {
      setError("Invalid code — check your authenticator app and try again.");
      return;
    }
    setEnroll(null);
    setEnabled(true);
    toast.success("Two-factor authentication enabled");
  };

  const disable = async () => {
    setError(null);
    setPending(true);
    const { data } = await supabase.auth.mfa.listFactors();
    const f = data?.totp?.find((x) => x.status === "verified");
    if (f) {
      const { error: err } = await supabase.auth.mfa.unenroll({
        factorId: f.id,
      });
      if (err) {
        setPending(false);
        setError(err.message);
        return;
      }
    }
    setPending(false);
    setEnabled(false);
    setEnroll(null);
    toast.success("Two-factor authentication disabled");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            enabled
              ? "bg-accent-green/15 text-accent-green"
              : "bg-surface-2 text-muted-foreground"
          }`}
        >
          {enabled ? (
            <ShieldCheck className="size-5" />
          ) : (
            <ShieldAlert className="size-5" />
          )}
        </span>
        <div>
          <h3 className="font-display text-xl text-foreground">
            Two-factor authentication
          </h3>
          <p className="text-sm text-muted-foreground">
            {enabled
              ? "On — you'll enter a code from your authenticator app when signing in."
              : "Add a second step at sign-in using an authenticator app (TOTP)."}
          </p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </p>
      ) : enroll ? (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Scan this QR code with Google Authenticator, Authy, or 1Password —
            then enter the 6-digit code to confirm.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Supabase returns the QR as an SVG data URL (allowed by CSP img-src data:). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enroll.qr}
              alt="Two-factor QR code"
              width={160}
              height={160}
              className="size-40 shrink-0 rounded-lg border border-border bg-white p-2"
            />
            <div className="min-w-0 space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Or enter this key manually
              </Label>
              <code className="block break-all rounded-md bg-surface-1 px-3 py-2 text-sm">
                {enroll.secret}
              </code>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="totp-code">6-digit code</Label>
            <Input
              id="totp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="max-w-[200px] tracking-[0.3em]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={verify}
              disabled={pending || code.length !== 6}
              className="gap-1.5"
            >
              {pending ? "Verifying…" : "Verify & enable"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEnroll(null)}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : enabled ? (
        <Button
          variant="outline"
          onClick={disable}
          disabled={pending}
          className="mt-4 border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
        >
          {pending ? "Disabling…" : "Disable 2FA"}
        </Button>
      ) : (
        <Button
          variant="gold"
          onClick={startEnroll}
          disabled={pending}
          className="mt-4"
        >
          {pending ? "Starting…" : "Enable 2FA"}
        </Button>
      )}
    </div>
  );
}
