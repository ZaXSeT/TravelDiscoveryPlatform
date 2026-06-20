"use client";

import { Clock, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { GeneratedTrip } from "@/features/trip-generator/types";

export function ResultPreview({
  trip,
  onSave,
  onRegenerate,
  saving,
  error,
}: {
  trip: GeneratedTrip;
  onSave: () => void;
  onRegenerate: () => void;
  saving?: boolean;
  error?: string | null;
}) {
  const overBudget = trip.budget.vsBudget < 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-accent-goldText">
            Suggested itinerary
          </p>
          <h2 className="mt-1 font-display text-3xl">
            {trip.days} days in {trip.destinationName}
          </h2>
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

      {/* Budget summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Stays", value: trip.budget.accommodation },
          { label: "Food", value: trip.budget.food },
          { label: "Transport", value: trip.budget.transport },
          { label: "Activities", value: trip.budget.activities },
        ].map((b) => (
          <div key={b.label} className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">{b.label}</p>
            <p className="font-medium tabular-nums">{formatMoney(b.value)}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-1 p-4">
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
        <ul className="space-y-1">
          {trip.notes.map((n) => (
            <li key={n} className="text-sm text-muted-foreground">
              • {n}
            </li>
          ))}
        </ul>
      )}

      {/* Day-by-day */}
      <div className="space-y-4">
        {trip.itinerary.map((day) => (
          <section
            key={day.dayIndex}
            className="rounded-lg border border-border bg-surface-1 p-4"
          >
            <h3 className="font-display text-lg">{day.title}</h3>
            <ul className="mt-3 space-y-2">
              {day.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.startTime && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {item.startTime}
                      </span>
                    )}
                    <span className="truncate font-medium">{item.title}</span>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums">
                    {item.cost === 0 ? "Free" : formatMoney(item.cost)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
