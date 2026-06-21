import Link from "next/link";
import { Fingerprint, ArrowRight, MapPin } from "lucide-react";
import { CldImage } from "@/components/media/cld-image";
import { Button } from "@/components/ui/button";
import { DnaRadar } from "@/features/destinations/components/dna-radar";
import { dnaArchetype, rankDestinations } from "@/features/travel-dna/scoring";
import { routes } from "@/constants/routes";
import type { Dna } from "@/types";

// Connected-hub view of the user's Travel DNA on their profile: archetype + radar + their
// top destination matches, or a prompt to take the assessment. Pure/server-renderable.
export function ProfileTravelDna({ dna }: { dna: Dna | null }) {
  if (!dna) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-surface-1">
          <Fingerprint className="size-6 text-accent-goldText" />
        </div>
        <h3 className="font-display text-2xl">Discover your Travel DNA</h3>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Take a quick assessment to reveal your traveler profile and unlock personalized
          destination matches and AI itineraries.
        </p>
        <Button asChild className="mt-5 gap-2">
          <Link href={routes.travelDna}>
            <Fingerprint className="size-4" />
            Take the assessment
          </Link>
        </Button>
      </div>
    );
  }

  const archetype = dnaArchetype(dna);
  const matches = rankDestinations(dna).slice(0, 3);

  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-[220px_1fr] md:items-center">
      <div className="mx-auto w-full max-w-[220px]">
        <DnaRadar dna={dna} name="you" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-accent-goldText">
          Your traveler profile
        </p>
        <h3 className="mt-1 font-display text-2xl">{archetype.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{archetype.blurb}</p>

        <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Your top matches
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {matches.map((m) => (
            <div
              key={m.destination.slug}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="relative h-20 w-full bg-surface-2">
                <CldImage
                  publicId={m.destination.media.thumbnail}
                  alt={m.destination.name}
                  width={320}
                  height={160}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <span className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {m.score}%
                </span>
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-medium">{m.destination.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {m.destination.country}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Button asChild variant="outline" className="gap-1.5">
            <Link href={routes.travelDna}>
              View full assessment
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
