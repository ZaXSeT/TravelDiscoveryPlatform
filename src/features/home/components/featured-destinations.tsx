import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { getFeatured } from "@/constants/destinations";
import { routes } from "@/constants/routes";

export function FeaturedDestinations() {
  const featured = getFeatured();

  return (
    <section id="featured" className="section-y bg-background">
      <PageContainer>
        <SectionHeader
          eyebrow="Featured"
          title="Destinations to start with"
          description="Hand-picked places that capture why we travel."
          action={
            <Button asChild variant="outline">
              <Link href={routes.explore}>View all destinations</Link>
            </Button>
          }
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {featured.map((d, i) => (
            <Reveal key={d.slug} delayMs={i * 80}>
              <DestinationCard destination={d} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
