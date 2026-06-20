import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { TripGeneratorClient } from "@/features/trip-generator/components/trip-generator-client";

export const metadata: Metadata = {
  title: "Trip Generator",
  description:
    "Tell us your budget, days, and travel style — get a day-by-day itinerary you can save and edit.",
};

export default function TripGeneratorPage() {
  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <SectionHeader
          eyebrow="Plan"
          title="Build a trip in seconds"
          description="A smart, rule-based planner: set your budget, days, and style, and we'll draft a day-by-day itinerary with an estimated budget — save it and make it yours."
        />
        <div className="mt-10">
          <TripGeneratorClient />
        </div>
      </PageContainer>
    </div>
  );
}
