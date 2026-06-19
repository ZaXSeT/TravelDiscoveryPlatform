"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createItinerary } from "@/features/itinerary/actions";
import { DESTINATIONS } from "@/constants/destinations";

export function CreateItineraryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destinationSlug, setDestinationSlug] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const res = await createItinerary({
        title: title.trim(),
        destinationSlug: destinationSlug || null,
      });
      if (!res.ok) {
        setError(res.error.message);
        if (res.error.fields) setFieldErrors(res.error.fields);
        return;
      }
      router.push(`/itineraries/${res.data.id}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-border bg-surface-1 p-5"
    >
      <h2 className="font-display text-xl">Plan a new trip</h2>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div className="space-y-1">
          <Label htmlFor="trip-title">Trip name</Label>
          <Input
            id="trip-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 7 Days in Bali"
            required
            aria-invalid={fieldErrors.title ? true : undefined}
          />
          {fieldErrors.title && (
            <p className="text-sm text-destructive">{fieldErrors.title}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="trip-destination">Destination</Label>
          <select
            id="trip-destination"
            value={destinationSlug}
            onChange={(e) => setDestinationSlug(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-44"
          >
            <option value="">Optional</option>
            {DESTINATIONS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending} className="gap-1.5">
          <Plus className="size-4" />
          {pending ? "Creating…" : "Create trip"}
        </Button>
      </div>
    </form>
  );
}
