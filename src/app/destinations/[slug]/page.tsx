import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Reveal } from "@/components/motion/reveal";
import { DestinationHero } from "@/features/destinations/components/destination-hero";
import { DnaRadar } from "@/features/destinations/components/dna-radar";
import { BudgetCard } from "@/features/destinations/components/budget-card";
import { GallerySection } from "@/features/destinations/components/gallery-section";
import { HiddenGems } from "@/features/destinations/components/hidden-gems";
import { NearbyList } from "@/features/destinations/components/nearby-list";
import { RelatedDestinations } from "@/features/destinations/components/related-destinations";
import { MapSection } from "@/features/destinations/components/map-section";
import { SaveButton } from "@/features/wishlist/components/save-button";
import {
  DESTINATION_SLUGS,
  getDestination,
  getRelated,
} from "@/constants/destinations";

export const dynamicParams = false; // only the 5 seeded slugs are valid

export function generateStaticParams() {
  return DESTINATION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return {};
  return {
    title: `${d.name}, ${d.country}`,
    description: d.summary,
    openGraph: {
      title: `${d.name}, ${d.country}`,
      description: d.summary,
      type: "article",
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) notFound();

  const related = getRelated(slug);

  return (
    <article>
      <DestinationHero destination={d} />

      <PageContainer className="section-y space-y-20 md:space-y-28">
        {/* Overview + tips */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader eyebrow="Overview" title={`Why ${d.name}`} />
            <p className="mt-4 max-w-prose text-lg text-muted-foreground">
              {d.description}
            </p>
            <p className="mt-4 text-sm font-medium text-accent-goldText">
              Best time to visit: {d.bestSeason}
            </p>
            <div className="mt-6">
              <SaveButton slug={d.slug} name={d.name} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-1 p-6">
            <h3 className="font-display text-xl">Travel tips</h3>
            <ul className="mt-4 space-y-3">
              {d.travelTips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm text-muted-foreground">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-gold" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Travel DNA + Budget */}
        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="Travel DNA"
              title="The character of the place"
              description="A quick read on what this destination is best for."
            />
            <div className="mt-8">
              <DnaRadar dna={d.dna} name={d.name} />
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow="Budget"
              title="What it costs"
              description="A realistic daily estimate to plan around."
            />
            <div className="mt-8">
              <BudgetCard budget={d.budget} />
            </div>
          </div>
        </section>

        {/* Gallery */}
        <Reveal>
          <section>
            <SectionHeader eyebrow="Gallery" title={`${d.name} in pictures`} />
            <div className="mt-8">
              <GallerySection images={d.media.gallery} name={d.name} />
            </div>
          </section>
        </Reveal>

        {/* Hidden gems */}
        <section>
          <SectionHeader
            eyebrow="Hidden gems"
            title="Beyond the guidebook"
            description="Local-favorite spots most visitors miss."
          />
          <div className="mt-8">
            <HiddenGems gems={d.hiddenGems} />
          </div>
        </section>

        {/* Nearby */}
        <section>
          <SectionHeader eyebrow="Nearby" title="Worth the detour" />
          <div className="mt-8">
            <NearbyList items={d.nearby} />
          </div>
        </section>

        {/* Map */}
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

        {/* Related */}
        {related.length > 0 && (
          <section>
            <SectionHeader eyebrow="Keep exploring" title="Related destinations" />
            <div className="mt-8">
              <RelatedDestinations items={related} />
            </div>
          </section>
        )}
      </PageContainer>
    </article>
  );
}
