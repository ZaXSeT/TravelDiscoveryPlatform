import { Hero } from "@/features/home/components/hero";
import { StaticGlobe } from "@/features/home/components/static-globe";
import { FeaturedDestinations } from "@/features/home/components/featured-destinations";
import { AiFeaturesSection } from "@/features/home/components/ai-features-section";
import { CategoryTiles } from "@/features/home/components/category-tiles";
import { InspirationSection } from "@/features/home/components/inspiration-section";
import { CtaSection } from "@/features/home/components/cta-section";

// Static homepage (SSG). Section order per 11_UI_PAGES_SPEC.txt.
export default function HomePage() {
  return (
    <>
      <Hero />
      <StaticGlobe />
      <FeaturedDestinations />
      <AiFeaturesSection />
      <CategoryTiles />
      <InspirationSection />
      <CtaSection />
    </>
  );
}
