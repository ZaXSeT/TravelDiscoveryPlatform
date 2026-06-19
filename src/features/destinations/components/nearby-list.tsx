import { CldImage } from "@/components/media/cld-image";
import { formatDistance } from "@/lib/format";
import type { NearbyAttraction } from "@/types";

export function NearbyList({ items }: { items: NearbyAttraction[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.name}
          className="group flex items-center justify-between border-b border-border py-6 first:border-t"
        >
          <div className="flex items-center gap-6 md:gap-8">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-surface-2 md:size-24">
              <CldImage
                publicId={item.image}
                alt={item.name}
                width={128}
                height={128}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
              />
            </div>
            <p className="font-display text-2xl md:text-3xl transition-colors group-hover:text-accent-goldText">
              {item.name}
            </p>
          </div>
          <p className="whitespace-nowrap pl-4 text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {formatDistance(item.distanceKm)}
          </p>
        </li>
      ))}
    </ul>
  );
}
