import Link from "next/link";
import { CldImage } from "@/components/media/cld-image";
import { routes } from "@/constants/routes";
import type { DestinationSummary } from "@/types";

interface DestinationCardProps {
  destination: DestinationSummary;
  priority?: boolean;
}

export function DestinationCard({
  destination: d,
  priority,
}: DestinationCardProps) {
  return (
    <Link
      href={routes.destination(d.slug)}
      className="group block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-2">
        <CldImage
          publicId={d.thumbnail}
          alt={`${d.name}, ${d.country}`}
          width={640}
          height={800}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        <div className="scrim pointer-events-none absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] opacity-85 sm:text-xs">
            {d.region}
          </p>
          <h3 className="mt-0.5 font-display text-lg sm:mt-1 sm:text-2xl">{d.name}</h3>
          <p className="text-xs opacity-90 sm:text-sm">{d.country}</p>
        </div>
      </div>
    </Link>
  );
}
