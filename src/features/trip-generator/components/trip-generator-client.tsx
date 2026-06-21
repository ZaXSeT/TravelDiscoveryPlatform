"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Fingerprint, ArrowRight, Check } from "lucide-react";
import { GeneratorForm } from "@/features/trip-generator/components/generator-form";
import { ResultPreview } from "@/features/trip-generator/components/result-preview";
import { generateTripAction, saveTrip } from "@/features/trip-generator/actions";
import type { GeneratedTrip, TripInput } from "@/features/trip-generator/types";
import type { TravelStyle } from "@/types";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";
import { useAuthGate } from "@/stores/use-auth-gate";
import { routes } from "@/constants/routes";

export function TripGeneratorClient({
  hasTravelDna = false,
  defaultStyle,
}: {
  hasTravelDna?: boolean;
  defaultStyle?: TravelStyle;
}) {
  const router = useRouter();
  const { user } = useAuthUser();
  const openGate = useAuthGate((s) => s.openGate);

  const [lastInput, setLastInput] = useState<TripInput | null>(null);
  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // On small screens, bring the result into view after generating.
  useEffect(() => {
    if (
      trip &&
      !generating &&
      typeof window !== "undefined" &&
      window.innerWidth < 1024
    ) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [trip, generating]);

  // Runs on the server: Gemini (grounded search) when configured, else the rule engine.
  // `bypassCache` (Regenerate) forces a fresh AI variation instead of the cached plan.
  const generate = async (inp: TripInput, opts?: { bypassCache?: boolean }) => {
    setError(null);
    setLastInput(inp);
    setGenerating(true);
    try {
      const result = await generateTripAction(inp, opts);
      setTrip(result);
    } catch {
      setError("Couldn't generate a trip right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const doSave = async (t: GeneratedTrip) => {
    setSaving(true);
    setError(null);
    const res = await saveTrip(t);
    setSaving(false);
    if (res.ok) router.push(routes.itinerary(res.data.id));
    else setError(res.error.message);
  };

  const save = () => {
    if (!trip) return;
    if (!user) {
      openGate({
        title: "Save your trip",
        description: "Sign in to keep this itinerary and edit it anytime.",
        onAuthed: () => doSave(trip),
      });
      return;
    }
    void doSave(trip);
  };

  return (
    <div className="space-y-6">
      {/* Travel DNA personalization banner */}
      <Link
        href={routes.travelDna}
        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm transition-colors hover:border-accent-gold"
      >
        <span className="inline-flex items-center gap-2 text-sm">
          <Fingerprint className="size-4 text-accent-goldText" />
          {hasTravelDna ? (
            <span className="text-foreground">
              Personalized with your <strong>Travel DNA</strong> — picks are matched to you.
            </span>
          ) : (
            <span className="text-muted-foreground">
              Take the <strong className="text-foreground">Travel DNA</strong> assessment
              for personalized destination matches.
            </span>
          )}
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>

      <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
        <div className="relative z-10">
          <GeneratorForm
            onGenerate={generate}
            pending={generating}
            defaultStyle={defaultStyle}
          />
        </div>
        <div ref={resultRef} className="relative z-0 scroll-mt-24">
          {generating ? (
            <GeneratingState />
          ) : trip ? (
            <ResultPreview
              trip={trip}
              onSave={save}
              onRegenerate={() =>
                lastInput && generate(lastInput, { bypassCache: true })
              }
              saving={saving}
              error={error}
              personalized={hasTravelDna}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-border bg-card p-10 text-center shadow-xl shadow-black/5"
            >
              <div className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-surface-1 shadow-inner">
                <div className="absolute inset-0 animate-ping rounded-full bg-accent-gold/20 opacity-20" />
                <Sparkles className="size-8 text-accent-goldText" />
              </div>
              <h3 className="font-display text-3xl tracking-tight text-foreground">
                Your journey awaits
              </h3>
              <p className="mt-4 max-w-sm text-lg text-muted-foreground">
                Set your budget, days, and style. We&apos;ll draft a day-by-day plan with
                real places, a route map, and an estimated budget.
              </p>
              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

const GEN_STEPS = [
  "Searching real places",
  "Mapping your route",
  "Estimating your budget",
  "Polishing the details",
];

// Stepped loading state: walks through the stages so the ~30s AI wait feels alive and
// intentional rather than frozen. The last step keeps spinning until generation returns.
function GeneratingState() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => Math.min(a + 1, GEN_STEPS.length - 1)),
      7000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-border bg-card p-10 text-center shadow-xl shadow-black/5">
      <Sparkles className="size-8 animate-pulse text-accent-goldText" />
      <h3 className="mt-6 font-display text-2xl">Planning your trip…</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Our AI is searching real places — this usually takes 20–40 seconds.
      </p>
      <ul className="mt-6 space-y-2.5 text-left">
        {GEN_STEPS.map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li
              key={label}
              className={`flex items-center gap-2.5 text-sm transition-colors ${
                done || current ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                {done ? (
                  <Check className="size-4 text-accent-green" />
                ) : current ? (
                  <Loader2 className="size-4 animate-spin text-accent-goldText" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
