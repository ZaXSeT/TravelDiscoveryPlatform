"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DESTINATIONS, EXPLORE_DESTINATIONS } from "@/constants/destinations";
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
  pending = false,
  defaultStyle,
}: {
  onGenerate: (input: TripInput) => void;
  pending?: boolean;
  defaultStyle?: TravelStyle;
}) {
  const [budget, setBudget] = useState("1500");
  const [days, setDays] = useState("7");
  const [style, setStyle] = useState<TravelStyle>(defaultStyle ?? "culture");
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
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/5 sm:p-8"
    >
      <h2 className="font-display text-2xl tracking-tight">Plan your trip</h2>

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
          <Select
            value={style}
            onValueChange={(val) => setStyle(val as TravelStyle)}
          >
            <SelectTrigger id="tg-style" className="h-11 w-full bg-card">
              <SelectValue placeholder="Select travel style" />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tg-destination">Destination</Label>
          <Select
            value={destinationSlug || "auto"}
            onValueChange={(val) => setDestinationSlug(val === "auto" ? "" : val)}
          >
            <SelectTrigger id="tg-destination" className="h-11 w-full bg-card">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="auto">Auto-pick for my style</SelectItem>
              {[...DESTINATIONS, ...EXPLORE_DESTINATIONS]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((d) => (
                  <SelectItem key={d.slug} value={d.slug}>
                    {d.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" size="lg" disabled={pending} className="w-full gap-2">
          <Wand2 className="size-4" />
          {pending ? "Generating…" : "Generate itinerary"}
        </Button>
      </div>
    </motion.form>
  );
}
