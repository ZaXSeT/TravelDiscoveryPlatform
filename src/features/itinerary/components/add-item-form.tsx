"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addItem, updateItem } from "@/features/itinerary/actions";
import { DESTINATIONS } from "@/constants/destinations";
import type { ItineraryItemRow } from "@/types/db";

interface AddItemFormProps {
  itineraryId: string;
  dayId: string;
  item?: ItineraryItemRow;
  onDone: () => void;
  onCancel?: () => void;
}

// Used for both add (no item) and edit (item provided).
export function AddItemForm({
  itineraryId,
  dayId,
  item,
  onDone,
  onCancel,
}: AddItemFormProps) {
  const router = useRouter();
  const isEdit = Boolean(item);

  const [title, setTitle] = useState(item?.title ?? "");
  const [startTime, setStartTime] = useState(item?.start_time?.slice(0, 5) ?? "");
  const [costDollars, setCostDollars] = useState(
    item ? String(item.cost / 100) : "",
  );
  const [note, setNote] = useState(item?.note ?? "");
  const [destinationSlug, setDestinationSlug] = useState(
    item?.destination_id ? "" : "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const cost = Math.round((parseFloat(costDollars) || 0) * 100);
      const payload = {
        title: title.trim(),
        startTime: startTime ? startTime : null,
        cost,
        note: note.trim() ? note.trim() : null,
        destinationSlug: destinationSlug || null,
      };
      const res =
        isEdit && item
          ? await updateItem(itineraryId, { id: item.id, ...payload })
          : await addItem(itineraryId, { dayId, ...payload });

      if (!res.ok) {
        setError(res.error.message);
        if (res.error.fields) setFieldErrors(res.error.fields);
        return;
      }
      onDone();
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-md border border-border bg-surface-1 p-3"
    >
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <Label htmlFor={`title-${dayId}-${item?.id ?? "new"}`}>Activity</Label>
        <Input
          id={`title-${dayId}-${item?.id ?? "new"}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Sunrise hike at Mount Batur"
          required
          aria-invalid={fieldErrors.title ? true : undefined}
        />
        {fieldErrors.title && (
          <p className="text-sm text-destructive">{fieldErrors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`time-${dayId}-${item?.id ?? "new"}`}>Time</Label>
          <Input
            id={`time-${dayId}-${item?.id ?? "new"}`}
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`cost-${dayId}-${item?.id ?? "new"}`}>Cost (USD)</Label>
          <Input
            id={`cost-${dayId}-${item?.id ?? "new"}`}
            type="number"
            min={0}
            step={1}
            inputMode="decimal"
            value={costDollars}
            onChange={(e) => setCostDollars(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`note-${dayId}-${item?.id ?? "new"}`}>Note</Label>
        <Input
          id={`note-${dayId}-${item?.id ?? "new"}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`dest-${dayId}-${item?.id ?? "new"}`}>
          Link a destination (optional)
        </Label>
        <select
          id={`dest-${dayId}-${item?.id ?? "new"}`}
          value={destinationSlug}
          onChange={(e) => setDestinationSlug(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">None</option>
          {DESTINATIONS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save activity" : "Add activity"}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
