"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemRow } from "@/features/itinerary/components/item-row";
import { AddItemForm } from "@/features/itinerary/components/add-item-form";
import {
  deleteDay,
  moveDay,
  updateDayTitle,
} from "@/features/itinerary/actions";
import type { PlannerDay } from "@/features/itinerary/types";

export function DayCard({
  itineraryId,
  day,
  isFirst,
  isLast,
}: {
  itineraryId: string;
  day: PlannerDay;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState(day.title ?? "");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<{ ok: boolean }>) => {
    setBusy(true);
    const res = await fn();
    if (res.ok) router.refresh();
    setBusy(false);
  };

  return (
    <section className="rounded-lg border border-border bg-surface-1 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <span className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground">
            Day {day.day_index}
          </span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if ((day.title ?? "") !== title)
                void run(() => updateDayTitle(itineraryId, day.id, title));
            }}
            placeholder="Add a title (optional)"
            aria-label={`Title for day ${day.day_index}`}
            className="h-9 border-transparent bg-transparent px-1 hover:border-input focus-visible:border-input"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Move day up"
            disabled={isFirst || busy}
            onClick={() => run(() => moveDay(itineraryId, day.id, "up"))}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Move day down"
            disabled={isLast || busy}
            onClick={() => run(() => moveDay(itineraryId, day.id, "down"))}
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Delete day ${day.day_index}`}
            disabled={busy}
            onClick={() => run(() => deleteDay(itineraryId, day.id))}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {day.items.length === 0 && !adding && (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
            No activities yet.
          </p>
        )}
        {day.items.map((item) => (
          <ItemRow key={item.id} itineraryId={itineraryId} item={item} />
        ))}
        {adding ? (
          <AddItemForm
            itineraryId={itineraryId}
            dayId={day.id}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-4" />
            Add activity
          </Button>
        )}
      </div>
    </section>
  );
}
