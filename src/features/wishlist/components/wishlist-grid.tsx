"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { wishlistRemove } from "@/features/wishlist/actions";
import { routes } from "@/constants/routes";
import type { DestinationSummary } from "@/types";

export function WishlistGrid({ initial }: { initial: DestinationSummary[] }) {
  const [items, setItems] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);

  const remove = async (slug: string) => {
    const prev = items;
    setPending(slug);
    setItems((cur) => cur.filter((d) => d.slug !== slug)); // optimistic
    const res = await wishlistRemove(slug);
    if (!res.ok) {
      setItems(prev); // revert
      toast.error("Couldn't remove that — please try again.");
    } else {
      toast.success("Removed from your wishlist");
    }
    setPending(null);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="size-6" />}
        title="Your wishlist is empty"
        description="Save destinations you love and they'll show up here."
        action={
          <Button asChild variant="gold" className="rounded-full px-6">
            <Link href={routes.explore}>Explore destinations</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((d) => (
        <div key={d.slug} className="relative">
          <DestinationCard destination={d} />
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() => remove(d.slug)}
            disabled={pending === d.slug}
            className="absolute right-3 top-3 z-10 gap-1.5"
            aria-label={`Remove ${d.name} from wishlist`}
          >
            <MapPin className="size-3.5" />
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
