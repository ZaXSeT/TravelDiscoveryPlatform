import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/feedback/loading-state";
import { ExploreClient } from "@/features/explore/components/explore-client";
import type { ExploreItem } from "@/features/explore/use-explore-filters";
import { CldImage } from "@/components/media/cld-image";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import {
  DESTINATIONS,
  EXPLORE_DESTINATIONS,
  toSummary,
  exploreToSummary,
  budgetPerDayFor,
} from "@/constants/destinations";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Search and filter destinations by region, vibe, and budget — find your next trip.",
};

// Static page; filtering happens client-side over this data (no server round-trips).
// Featured (Tier 1) listed first, then the wider Explore (Tier 2) catalog.
const items: ExploreItem[] = [
  ...DESTINATIONS.map((d) => ({
    ...toSummary(d),
    budgetPerDay: budgetPerDayFor(d),
  })),
  ...EXPLORE_DESTINATIONS.map((d) => ({
    ...exploreToSummary(d),
    budgetPerDay: budgetPerDayFor(d),
  })),
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Cinematic Hero Header */}
      <section
        data-theme="dark"
        className="relative flex min-h-[50svh] items-center overflow-hidden bg-dark-0 pt-20 text-white"
      >
        <Parallax speed={0.15} className="absolute inset-x-0 -top-[20%] h-[140%]">
          <CldImage
            publicId="go/category/landscape"
            alt="Breathtaking mountain landscape"
            width={2560}
            height={1440}
            fill
            sizes="100vw"
            className="object-cover opacity-80"
          />
        </Parallax>
        
        {/* Clean dark overlay for text readability without muddy gradients */}
        <div className="absolute inset-0 bg-dark-0/40" />

        <PageContainer className="relative z-10 w-full py-20 pb-16">
          <div className="max-w-3xl">
            <Reveal>
              <span className="text-sm font-medium uppercase tracking-[0.25em] text-accent-gold">
                Destinations
              </span>
            </Reveal>
            <Reveal delayMs={100}>
              <h1 className="mt-6 font-display text-5xl leading-[1.1] sm:text-6xl md:text-7xl">
                Explore the world's <br className="hidden md:block" />
                <span className="text-white/80">most unforgettable places.</span>
              </h1>
            </Reveal>
            <Reveal delayMs={200}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
                Search, filter, and compare unique travel experiences carefully curated
                to inspire your next grand adventure.
              </p>
            </Reveal>
          </div>
        </PageContainer>
      </section>

      {/* Main Filter and Grid Content */}
      <PageContainer className="pb-24">
        {/* We lift the search bar to slightly overlap the hero section using a negative margin */}
        <div className="relative z-20 -mt-8">
          <Suspense fallback={<LoadingState variant="grid" />}>
            <ExploreClient items={items} />
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
}
