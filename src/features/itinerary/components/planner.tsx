"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/feedback/empty-state";
import { BudgetSummary } from "@/features/itinerary/components/budget-summary";
import { DayCard } from "@/features/itinerary/components/day-card";
import {
  addDay,
  deleteItinerary,
  updateItineraryTitle,
} from "@/features/itinerary/actions";
import { routes } from "@/constants/routes";
import type { ActionResult } from "@/types";
import type { PlannerData } from "@/features/itinerary/types";

export function Planner({ data }: { data: PlannerData }) {
  const router = useRouter();
  const { itinerary, days } = data;
  const [title, setTitle] = useState(itinerary.title);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<ActionResult>) => {
    setBusy(true);
    const res = await fn();
    if (res.ok) router.refresh();
    setBusy(false);
  };

  const removeTrip = async () => {
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;
    setBusy(true);
    const res = await deleteItinerary(itinerary.id);
    if (res.ok) router.push(routes.itineraries);
    else setBusy(false);
  };

  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <Link
          href={routes.itineraries}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All trips
        </Link>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title.trim() && title !== itinerary.title)
                void run(() => updateItineraryTitle(itinerary.id, title));
            }}
            aria-label="Trip title"
            className="h-auto border-transparent bg-transparent px-0 py-1 font-display text-3xl shadow-none hover:border-input focus-visible:border-input md:text-4xl"
          />
          <Button
            type="button"
            variant="outline"
            onClick={removeTrip}
            disabled={busy}
            className="shrink-0 gap-2 text-destructive"
          >
            <Trash2 className="size-4" />
            Delete trip
          </Button>
        </div>

        <div className="mt-6">
          <BudgetSummary days={days} />
        </div>

        <div className="mt-8 space-y-4">
          {days.length === 0 ? (
            <EmptyState
              title="No days yet"
              description="Add your first day to start planning."
              action={
                <Button onClick={() => run(() => addDay(itinerary.id))} disabled={busy}>
                  Add your first day
                </Button>
              }
            />
          ) : (
            days.map((day, i) => (
              <DayCard
                key={day.id}
                itineraryId={itinerary.id}
                day={day}
                isFirst={i === 0}
                isLast={i === days.length - 1}
              />
            ))
          )}
        </div>

        {days.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 gap-1.5"
            onClick={() => run(() => addDay(itinerary.id))}
            disabled={busy}
          >
            <Plus className="size-4" />
            Add day
          </Button>
        )}
      </PageContainer>
    </div>
  );
}
