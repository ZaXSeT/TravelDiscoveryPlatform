import { MapPin } from "lucide-react";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { ExploreItem } from "@/features/explore/use-explore-filters";

interface DestinationGridProps {
  items: ExploreItem[];
  onReset: () => void;
}

export function DestinationGrid({ items, onReset }: DestinationGridProps) {
  if (items.length === 0) {
    return (
      <Reveal>
        <EmptyState
          icon={<MapPin className="size-6" />}
          title="No destinations match"
          description="Try removing a filter or searching for something else."
          action={
            <Button variant="outline" onClick={onReset} className="rounded-full">
              Clear all filters
            </Button>
          }
        />
      </Reveal>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5 xl:gap-5">
      {items.map((d, i) => (
        <Reveal key={d.slug} delayMs={(i % 6) * 100}>
          <DestinationCard destination={d} priority={i < 3} />
        </Reveal>
      ))}
    </div>
  );
}
