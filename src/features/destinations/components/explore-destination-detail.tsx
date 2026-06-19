import { CldImage } from "@/components/media/cld-image";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { MapSection } from "@/features/destinations/components/map-section";
import { RelatedDestinations } from "@/features/destinations/components/related-destinations";
import { formatMoney } from "@/lib/format";
import type { DestinationSummary, ExploreDestination } from "@/types";

// Lightweight Tier-2 detail page: hero, overview, budget estimate, map, and a nudge
// toward the premium featured destinations. No gallery/DNA/hidden-gems/save (those are
// Tier 1 only).
export function ExploreDestinationDetail({
  destination: d,
  featured,
}: {
  destination: ExploreDestination;
  featured: DestinationSummary[];
}) {
  return (
    <article>
      <section
        data-theme="dark"
        className="relative flex min-h-[60svh] items-end overflow-hidden bg-dark-0 text-white"
      >
        <CldImage
          publicId={d.hero}
          alt={`${d.name}, ${d.country}`}
          width={1920}
          height={1280}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="scrim pointer-events-none absolute inset-0" />
        <PageContainer className="relative z-10 pb-12 pt-28">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">
            {d.region} · {d.country}
          </p>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl">{d.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{d.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {d.categories.map((c) => (
              <Badge key={c} variant="gold">
                {c}
              </Badge>
            ))}
          </div>
        </PageContainer>
      </section>

      <PageContainer className="section-y space-y-16 md:space-y-20">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader eyebrow="Overview" title={`About ${d.name}`} />
            <p className="mt-4 max-w-prose text-lg text-muted-foreground">
              {d.summary}
            </p>
            <p className="mt-4 text-sm font-medium text-accent-goldText">
              Best time to visit: {d.bestSeason}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-1 p-6">
            <p className="text-sm text-muted-foreground">Estimated daily budget</p>
            <p className="mt-1 font-display text-3xl tabular-nums text-accent-goldText">
              {formatMoney(d.budgetPerDay)}
              <span className="text-base text-muted-foreground"> / day</span>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Mid-range, per person. Excludes flights.
            </p>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Map" title="Where you'll be" />
          <div className="mt-8">
            <MapSection
              lat={d.coordinates.lat}
              lng={d.coordinates.lng}
              name={d.name}
            />
          </div>
        </section>

        {featured.length > 0 && (
          <section>
            <SectionHeader
              eyebrow="Featured"
              title="Go deeper on a premium destination"
              description="Full guides, budgets, hidden gems, and trip planning."
            />
            <div className="mt-8">
              <RelatedDestinations items={featured} />
            </div>
          </section>
        )}
      </PageContainer>
    </article>
  );
}
