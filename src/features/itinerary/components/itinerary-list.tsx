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
        <h3 className="text-2xl md:text-3xl font-semibold text-muted-foreground">The map is blank</h3>
        <p className="mt-2 text-base text-muted-foreground/70">Begin a new journey above</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
      {items.map((it) => (
        <li
          key={it.id}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-surface-1/50 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-surface-1 hover:shadow-xl"
        >
          <div className="mb-8 flex items-start justify-between gap-4">
            <Link href={routes.itinerary(it.id)} className="min-w-0 flex-1 outline-none">
              <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-primary transition-colors group-hover:text-accent-goldText">
                {it.title}
              </h3>
            </Link>
            
            <Button
              type="button"
              variant="ghost"
              aria-label={`Delete ${it.title}`}
              disabled={pending === it.id}
              onClick={() => remove(it.id)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus:opacity-100 group-hover:opacity-100 md:-mr-2 md:-mt-2"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          
          <Link href={routes.itinerary(it.id)} className="mt-auto flex-1 outline-none">
            <div className="flex flex-wrap items-center gap-2">
              {it.destinationName && (
                <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
                  <MapPin className="size-3.5 text-accent-goldText" />
                  <span>{it.destinationName}</span>
                </div>
              )}
              <div className="rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
                <span className="text-foreground">{formatMoney(it.total_budget)}</span> EST
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
