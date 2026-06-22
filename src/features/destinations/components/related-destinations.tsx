import { DestinationCard } from "@/features/destinations/components/destination-card";
import type { DestinationSummary } from "@/types";

export function RelatedDestinations({
  items,
}: {
  items: DestinationSummary[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {items.map((d) => (
        <DestinationCard key={d.slug} destination={d} />
      ))}
    </div>
  );
}
