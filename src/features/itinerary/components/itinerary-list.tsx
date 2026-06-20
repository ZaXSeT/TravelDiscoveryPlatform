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
      <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center border-t border-b border-black/5">
        <MapPin className="size-8 md:size-12 opacity-20 mb-8" strokeWidth={1} />
        <h3 className="font-serif text-2xl md:text-4xl font-light text-black/40">The map is blank</h3>
        <p className="mt-4 text-xs md:text-sm uppercase tracking-[0.2em] text-black/30">Begin a new journey above</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((it) => (
        <li
          key={it.id}
          className="group relative border-b border-black/10 hover:border-black/30 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-10 md:py-12">
            <Link href={routes.itinerary(it.id)} className="flex-1 min-w-0">
              <p className="truncate font-serif text-3xl md:text-5xl font-light text-primary group-hover:text-accent-gold-text transition-colors">
                {it.title}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs md:text-sm tracking-[0.2em] uppercase text-black/40 font-medium">
                {it.destinationName && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {it.destinationName}
                  </span>
                )}
                <span>{formatMoney(it.total_budget)} EST</span>
              </div>
            </Link>
            
            <Button
              type="button"
              variant="ghost"
              aria-label={`Delete ${it.title}`}
              disabled={pending === it.id}
              onClick={() => remove(it.id)}
              className="absolute right-0 top-8 md:static opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full size-12 flex items-center justify-center"
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
