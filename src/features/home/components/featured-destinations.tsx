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
        <div className="mt-8 -mx-4 px-4 flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:snap-none sm:pb-0 lg:grid-cols-3">
          {featured.map((d, i) => (
            <Reveal 
              key={d.slug} 
              delayMs={i * 80}
              className="shrink-0 snap-start w-[75vw] max-w-[280px] sm:w-auto sm:max-w-none"
            >
              <DestinationCard destination={d} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
