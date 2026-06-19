import { MapPin } from "lucide-react";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import type { ExploreItem } from "@/features/explore/use-explore-filters";

interface DestinationGridProps {
  items: ExploreItem[];
  onReset: () => void;
}

export function DestinationGrid({ items, onReset }: DestinationGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="size-6" />}
        title="No destinations match"
        description="Try removing a filter or searching for something else."
        action={
          <Button variant="outline" onClick={onReset}>
            Clear filters
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((d, i) => (
        <DestinationCard key={d.slug} destination={d} priority={i < 3} />
      ))}
    </div>
  );
}
