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
        <Button variant="gold" asChild className="mt-5 gap-2">
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
    <div className="grid gap-8 rounded-[2rem] border border-border bg-card p-6 sm:p-8 md:grid-cols-[260px_1fr] md:items-center">
      <div className="mx-auto w-full max-w-[280px] md:max-w-[260px]">
        <DnaRadar dna={dna} name="you" />
      </div>
      <div className="text-center md:text-left min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold/80">
          Your traveler profile
        </p>
        <h3 className="mt-2 font-display text-3xl">{archetype.title}</h3>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground leading-relaxed md:mx-0">{archetype.blurb}</p>

        <p className="mt-8 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Your top matches
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
          {matches.map((m) => (
            <div
              key={m.destination.slug}
              className="flex items-center gap-4 rounded-xl border border-border/50 bg-surface-1/50 p-2 sm:block sm:overflow-hidden sm:border-border sm:bg-transparent sm:p-0"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:aspect-video sm:h-auto sm:w-full sm:rounded-none">
                <CldImage
                  publicId={m.destination.media.thumbnail}
                  alt={m.destination.name}
                  width={640}
                  height={360}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute bottom-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white sm:top-1.5 sm:right-1.5 sm:bottom-auto sm:rounded-full sm:px-2 sm:text-[11px]">
                  {m.score}%
                </span>
              </div>
              <div className="flex-1 text-left sm:p-2.5">
                <p className="truncate text-sm font-medium">{m.destination.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
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
