"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { deleteItem } from "@/features/itinerary/actions";
import { AddItemForm } from "@/features/itinerary/components/add-item-form";
import type { ItineraryItemRow } from "@/types/db";

export function ItemRow({
  itineraryId,
  item,
}: {
  itineraryId: string;
  item: ItineraryItemRow;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  if (editing) {
    return (
      <AddItemForm
        itineraryId={itineraryId}
        dayId={item.day_id}
        item={item}
        onDone={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const remove = async () => {
    setPending(true);
    const res = await deleteItem(itineraryId, item.id);
    if (res.ok) router.refresh();
    setPending(false);
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-medium">{item.title}</p>
          {item.start_time && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {item.start_time.slice(0, 5)}
            </span>
          )}
        </div>
        {item.note && (
          <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="tabular-nums text-sm font-medium">
          {formatMoney(item.cost)}
        </span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit activity"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Delete activity"
          onClick={remove}
          disabled={pending}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
