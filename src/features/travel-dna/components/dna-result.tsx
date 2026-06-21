"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, RotateCcw, Wand2, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CldImage } from "@/components/media/cld-image";
import { DnaRadar } from "@/features/destinations/components/dna-radar";
import {
  dnaArchetype,
  rankDestinations,
} from "@/features/travel-dna/scoring";
import { saveTravelDna } from "@/features/travel-dna/actions";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";
import { useAuthGate } from "@/stores/use-auth-gate";
import { routes } from "@/constants/routes";
import type { Dna } from "@/types";

export function DnaResult({
  dna,
  onRetake,
  savedInitially = false,
}: {
  dna: Dna;
  onRetake: () => void;
  savedInitially?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuthUser();
  const openGate = useAuthGate((s) => s.openGate);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(savedInitially);
  const [error, setError] = useState<string | null>(null);

  const archetype = dnaArchetype(dna);
  const matches = rankDestinations(dna).slice(0, 4);

  const doSave = async () => {
    setSaving(true);
    setError(null);
    const res = await saveTravelDna(dna);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      return true;
    }
    setError(res.error.message);
    return false;
  };

  const save = () => {
    if (!user) {
      openGate({
        title: "Save your Travel DNA",
        description: "Sign in to save your profile and reuse it for trip planning.",
        onAuthed: () => void doSave(),
      });
      return;
    }
    void doSave();
  };

  const planTrip = () => {
    const go = async () => {
      await doSave();
      router.push(routes.tripGenerator);
    };
    if (!user) {
      openGate({
        title: "Save & plan your trip",
        description: "Sign in to save your Travel DNA and build a personalized itinerary.",
        onAuthed: () => void go(),
      });
      return;
    }
    void go();
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-10 md:grid-cols-[260px_1fr] md:items-center"
      >
        <div className="mx-auto w-full max-w-[260px]">
          <DnaRadar dna={dna} name="you" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-accent-goldText">
            Your Travel DNA
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl">{archetype.title}</h2>
          <p className="mt-3 text-muted-foreground">{archetype.blurb}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={planTrip} disabled={saving} className="gap-1.5">
              <Wand2 className="size-4" />
              {saving ? "Saving…" : "Save & plan a trip"}
            </Button>
            <Button variant="outline" onClick={save} disabled={saving} className="gap-1.5">
              {saved ? <Check className="size-4" /> : <Save className="size-4" />}
              {saved ? "Saved" : "Save Travel DNA"}
            </Button>
            <Button variant="ghost" onClick={onRetake} className="gap-1.5">
              <RotateCcw className="size-4" />
              Retake
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </motion.div>

      <div>
        <h3 className="font-display text-2xl">Your top destination matches</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by how well each destination&apos;s Travel DNA fits yours — with the why.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {matches.map((m, i) => (
            <motion.article
              key={m.destination.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="relative h-36 w-full bg-surface-2">
                <CldImage
                  publicId={m.destination.media.thumbnail}
                  alt={m.destination.name}
                  width={640}
                  height={360}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                />
                <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                  {m.score}% match
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {m.destination.country}
                </div>
                <h4 className="mt-0.5 font-display text-xl">{m.destination.name}</h4>
                <ul className="mt-2 space-y-1">
                  {m.reasons.length > 0 ? (
                    m.reasons.map((r) => (
                      <li key={r} className="text-sm text-muted-foreground">
                        • {r}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">
                      • A well-rounded match for your travel style
                    </li>
                  )}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
