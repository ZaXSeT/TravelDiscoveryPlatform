import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { LoadingState } from "@/components/feedback/loading-state";
import { ExploreClient } from "@/features/explore/components/explore-client";
import type { ExploreItem } from "@/features/explore/use-explore-filters";
import { DESTINATIONS, toSummary } from "@/constants/destinations";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Search and filter destinations by region, vibe, and budget — find your next trip.",
};

// Static page; filtering happens client-side over this data (no server round-trips).
const items: ExploreItem[] = DESTINATIONS.map((d) => ({
  ...toSummary(d),
  budgetPerDay: d.budget.accommodation + d.budget.food + d.budget.transport,
}));

export default function ExplorePage() {
  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <SectionHeader
          eyebrow="Explore"
          title="Find your next destination"
          description="Search, filter, and compare five of the world's most unforgettable places."
        />
        <div className="mt-10">
          <Suspense fallback={<LoadingState variant="grid" />}>
            <ExploreClient items={items} />
          </Suspense>
        </div>
      </PageContainer>
    </div>
  );
}
