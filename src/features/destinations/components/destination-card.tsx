import Link from "next/link";
import { CldImage } from "@/components/media/cld-image";
import { routes } from "@/constants/routes";
import type { DestinationSummary } from "@/types";

interface DestinationCardProps {
  destination: DestinationSummary;
  priority?: boolean;
}

import { ArrowUpRight } from "lucide-react";

export function DestinationCard({
  destination: d,
  priority,
}: DestinationCardProps) {
  return (
    <Link
      href={routes.destination(d.slug)}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface-2 shadow-sm transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-accent-gold/10">
        <CldImage
          publicId={d.thumbnail}
          alt={`${d.name}, ${d.country}`}
          width={640}
          height={800}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.08] motion-reduce:transition-none"
        />
        {/* Smoother, richer gradient scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
        
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold transition-transform duration-500 group-hover:-translate-y-1">
            {d.region}
          </p>
          <h3 className="mt-2 font-display text-3xl transition-transform duration-500 group-hover:-translate-y-1 sm:text-4xl">{d.name}</h3>
          
          <div className="mt-3 flex items-center justify-between transition-transform duration-500 group-hover:-translate-y-1">
            <p className="text-sm font-medium text-white/90 sm:text-base">{d.country}</p>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:bg-accent-gold group-hover:text-black group-hover:opacity-100">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
