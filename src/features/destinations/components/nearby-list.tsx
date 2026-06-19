import { CldImage } from "@/components/media/cld-image";
import { formatDistance } from "@/lib/format";
import type { NearbyAttraction } from "@/types";

export function NearbyList({ items }: { items: NearbyAttraction[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.name}
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-3"
        >
          <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
            <CldImage
              publicId={item.image}
              alt={item.name}
              width={128}
              height={128}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistance(item.distanceKm)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
