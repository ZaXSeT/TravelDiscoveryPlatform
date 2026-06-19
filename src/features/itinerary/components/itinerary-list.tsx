"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatMoney } from "@/lib/format";
import { deleteItinerary } from "@/features/itinerary/actions";
import { routes } from "@/constants/routes";
import type { ItineraryListItem } from "@/features/itinerary/types";

export function ItineraryList({ initial }: { initial: ItineraryListItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this trip?")) return;
    const prev = items;
    setPending(id);
    setItems((cur) => cur.filter((i) => i.id !== id)); // optimistic
    const res = await deleteItinerary(id);
    if (!res.ok) setItems(prev);
    else router.refresh();
    setPending(null);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="size-6" />}
        title="No trips yet"
        description="Create your first itinerary above to start planning."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li
          key={it.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
        >
          <Link href={routes.itinerary(it.id)} className="min-w-0 flex-1">
            <p className="truncate font-display text-lg">{it.title}</p>
            <p className="text-sm text-muted-foreground">
              {it.destinationName ? `${it.destinationName} · ` : ""}
              {formatMoney(it.total_budget)} estimated
            </p>
          </Link>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Delete ${it.title}`}
            disabled={pending === it.id}
            onClick={() => remove(it.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
