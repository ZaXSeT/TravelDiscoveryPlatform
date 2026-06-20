"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { GeneratorForm } from "@/features/trip-generator/components/generator-form";
import { ResultPreview } from "@/features/trip-generator/components/result-preview";
import { generateTrip } from "@/features/trip-generator/engine";
import { saveGeneratedTrip } from "@/features/trip-generator/actions";
import type { GeneratedTrip, TripInput } from "@/features/trip-generator/types";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";
import { useAuthGate } from "@/stores/use-auth-gate";
import { routes } from "@/constants/routes";

export function TripGeneratorClient() {
  const router = useRouter();
  const { user } = useAuthUser();
  const openGate = useAuthGate((s) => s.openGate);

  const [input, setInput] = useState<TripInput | null>(null);
  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = (inp: TripInput) => {
    setError(null);
    setInput(inp);
    setTrip(generateTrip(inp)); // deterministic, runs client-side
  };

  const doSave = async (inp: TripInput) => {
    setSaving(true);
    setError(null);
    const res = await saveGeneratedTrip(inp);
    setSaving(false);
    if (res.ok) router.push(routes.itinerary(res.data.id));
    else setError(res.error.message);
  };

  const save = () => {
    if (!input) return;
    if (!user) {
      openGate({
        title: "Save your trip",
        description: "Sign in to keep this itinerary and edit it anytime.",
        onAuthed: () => doSave(input),
      });
      return;
    }
    void doSave(input);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
      <GeneratorForm onGenerate={generate} />
      <div>
        {trip ? (
          <ResultPreview
            trip={trip}
            onSave={save}
            onRegenerate={() => input && generate(input)}
            saving={saving}
            error={error}
          />
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-1 p-10 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-2 text-accent-goldText">
              <Wand2 className="size-6" />
            </div>
            <h3 className="font-display text-xl">Your itinerary will appear here</h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Set a budget, days, and style — then generate a day-by-day plan you can
              save and edit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
