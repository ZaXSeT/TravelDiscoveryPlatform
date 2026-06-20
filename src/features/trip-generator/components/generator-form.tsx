"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DESTINATIONS } from "@/constants/destinations";
import type { TravelStyle } from "@/types";
import type { TripInput } from "@/features/trip-generator/types";

const STYLES: { value: TravelStyle; label: string }[] = [
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "nature", label: "Nature" },
  { value: "luxury", label: "Luxury" },
];

export function GeneratorForm({
  onGenerate,
}: {
  onGenerate: (input: TripInput) => void;
}) {
  const [budget, setBudget] = useState("1500");
  const [days, setDays] = useState("7");
  const [style, setStyle] = useState<TravelStyle>("culture");
  const [destinationSlug, setDestinationSlug] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetCents = Math.min(
      5_000_000,
      Math.max(20_000, Math.round((parseFloat(budget) || 0) * 100)),
    );
    const d = Math.min(14, Math.max(1, parseInt(days, 10) || 7));
    onGenerate({
      budget: budgetCents,
      days: d,
      style,
      destinationSlug: destinationSlug || null,
    });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-border bg-surface-1 p-6"
    >
      <h2 className="font-display text-xl">Plan your trip</h2>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tg-budget">Total budget (USD)</Label>
            <Input
              id="tg-budget"
              type="number"
              min={200}
              max={50000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tg-days">Days</Label>
            <Input
              id="tg-days"
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tg-style">Travel style</Label>
          <select
            id="tg-style"
            value={style}
            onChange={(e) => setStyle(e.target.value as TravelStyle)}
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tg-destination">Destination</Label>
          <select
            id="tg-destination"
            value={destinationSlug}
            onChange={(e) => setDestinationSlug(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Auto-pick for my style</option>
            {DESTINATIONS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="lg" className="w-full gap-2">
          <Wand2 className="size-4" />
          Generate itinerary
        </Button>
      </div>
    </form>
  );
}
