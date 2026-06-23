"use client";

import {
  Clock,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  Wand2,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CldImage } from "@/components/media/cld-image";
import { formatMoney } from "@/lib/format";
import { TripRouteMap } from "@/features/trip-generator/components/trip-route-map";
import type { RoutePoint } from "@/features/trip-generator/components/trip-route-leaflet";
import { DnaRadar } from "@/features/destinations/components/dna-radar";
import { ALL_DESTINATIONS } from "@/constants/destinations";
import type { GeneratedTrip } from "@/features/trip-generator/types";

export function ResultPreview({
  trip,
  onSave,
  onRegenerate,
  saving,
  error,
  personalized = false,
  offlineNote,
}: {
  trip: GeneratedTrip;
  onSave: () => void;
  onRegenerate: () => void;
  saving?: boolean;
  error?: string | null;
  personalized?: boolean;
  offlineNote?: string;
}) {
  const rateLimited = trip.fallbackReason === "rate_limited";
  const overBudget = trip.budget.vsBudget < 0;

  // Number every place sequentially across the whole trip so the list and the map agree.
  let counter = 0;
  const numbered = trip.itinerary.map((day) => ({
    ...day,
    items: day.items.map((it) => ({ ...it, n: ++counter })),
  }));
  const points: RoutePoint[] = numbered
    .flatMap((d) => d.items)
    .filter(
      (it): it is (typeof it) & { lat: number; lng: number } =>
        typeof it.lat === "number" && typeof it.lng === "number",
    )
    .map((it) => ({
      lat: it.lat,
      lng: it.lng,
      label: it.title,
      index: it.n,
      description: it.description,
      cost: it.cost,
      startTime: it.startTime,
    }));

  const dest = ALL_DESTINATIONS.find((d) => d.slug === trip.destinationSlug);

  return (
    <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {trip.source === "gemini" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-gold/15 px-2.5 py-1 text-xs font-medium text-accent-goldText">
                <Sparkles className="size-3.5" />
                AI-generated
              </span>
            ) : rateLimited ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700">
                <Wand2 className="size-3.5" />
                Daily limit reached
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Wand2 className="size-3.5" />
                Offline planner
              </span>
            )}
            {personalized && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground">
                <Fingerprint className="size-3.5 text-accent-goldText" />
                Matched to your Travel DNA
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-3xl">
            {trip.days} days in {trip.destinationName}
          </h2>
          {trip.source === "rules" && (
            <p
              className={`mt-1 text-xs ${rateLimited ? "text-amber-700" : "text-muted-foreground"}`}
            >
              {offlineNote ??
                "AI was unavailable - generated with the built-in planner."}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRegenerate} className="gap-1.5">
            <RotateCcw className="size-4" />
            Regenerate
          </Button>
          <Button onClick={onSave} disabled={saving} className="gap-1.5">
            <Save className="size-4" />
            {saving ? "Saving…" : "Save trip"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Route map */}
      {points.length > 0 && (
        <div>
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <MapPin className="size-3.5" />
            Your route
          </p>
          <TripRouteMap points={points} />
        </div>
      )}

      {/* Travel DNA (destination = source of truth) the plan is tuned to */}
      {dest && (
        <div className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-border bg-surface-1 p-5 sm:grid-cols-[180px_1fr]">
          <div className="mx-auto w-full max-w-[180px]">
            <DnaRadar dna={dest.dna} name={dest.name} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-accent-goldText">
              Travel DNA
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tuned to {dest.name}&apos;s character and your {trip.style} style - the AI
              weighted activities against this destination&apos;s Travel DNA.
            </p>
          </div>
        </div>
      )}

      {/* Budget summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Stays", value: trip.budget.accommodation },
          { label: "Food", value: trip.budget.food },
          { label: "Transport", value: trip.budget.transport },
          { label: "Activities", value: trip.budget.activities },
        ].map((b) => (
          <div key={b.label} className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{b.label}</p>
            <p className="mt-1 font-medium tabular-nums">{formatMoney(b.value)}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-1 p-5 shadow-sm">
        <div>
          <p className="text-sm text-muted-foreground">Estimated total</p>
          <p className="font-display text-2xl tabular-nums text-accent-goldText">
            {formatMoney(trip.budget.total)}
          </p>
        </div>
        <p className={`text-sm ${overBudget ? "text-destructive" : "text-accent-green"}`}>
          {overBudget
            ? `${formatMoney(-trip.budget.vsBudget)} over budget`
            : `${formatMoney(trip.budget.vsBudget)} under budget`}
        </p>
      </div>

      {trip.notes.length > 0 && (
        <ul className="space-y-2 rounded-xl bg-surface-1/50 p-5">
          {trip.notes.map((n) => (
            <li key={n} className="text-sm text-muted-foreground">
              • {n}
            </li>
          ))}
        </ul>
      )}

      {/* Day-by-day with places, photos & descriptions (2 columns on wide screens to
          keep the plan from running too long) */}
      <div className="grid gap-4 md:grid-cols-2">
        {numbered.map((day) => (
          <section
            key={day.dayIndex}
            className="rounded-2xl border border-border bg-surface-1 p-5 shadow-sm"
          >
            <h3 className="font-display text-xl">
              Day {day.dayIndex}
              {day.title && (
                <span className="text-muted-foreground"> · {day.title}</span>
              )}
            </h3>
            <ul className="mt-4 space-y-3">
              {day.items.map((item) => (
                <li
                  key={item.n}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-3 shadow-sm"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    {item.image && (
                      <CldImage
                        publicId={item.image}
                        alt={item.title}
                        width={160}
                        height={160}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                    <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-accent-gold text-[11px] font-semibold text-[#1a1408]">
                      {item.n}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-medium text-foreground">{item.title}</span>
                      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                        {item.cost === 0 ? "Free" : formatMoney(item.cost)}
                      </span>
                    </div>
                    {item.startTime && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {item.startTime}
                      </span>
                    )}
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
