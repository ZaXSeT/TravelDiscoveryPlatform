import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { HeroSlideshow } from "./hero-slideshow";
import { HeroTitle } from "./hero-title";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

// Phase 2 hero: static poster (LCP image) + premium type. Video + split-text land in
// Phase 4 (08_PERFORMANCE_BUDGETS.md: LCP is always a static image; mobile = image only).
export function Hero() {
  return (
    <section
      data-theme="dark"
      className="relative flex min-h-[100svh] w-full flex-col justify-end overflow-hidden bg-dark-0 text-white pb-16 md:pb-20"
    >
      <HeroSlideshow
        images={[
          { id: "go/destinations/tokyo/hero", label: "Tokyo skyline at night" },
          { id: "go/destinations/switzerland/hero", label: "Swiss Alps landscape" },
          { id: "go/destinations/paris/hero", label: "Paris city view" },
          { id: "go/destinations/new-york/hero", label: "New York city skyline" },
          { id: "go/destinations/bali/hero", label: "Bali natural landscape" },
        ]}
      />
      <div className="scrim pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-16">
        <div className="flex w-full flex-col md:flex-row md:items-end md:justify-between gap-10 md:gap-20">
          
          {/* GIANT TEXT AREA */}
          <div className="max-w-[90vw] md:max-w-[65vw]">
            <Reveal waitForPreloader={true}>
              <p className="mb-6 text-[12px] md:text-[14px] font-medium uppercase tracking-[0.4em] text-white/70">
                Travel discovery, reimagined
              </p>
            </Reveal>
            <HeroTitle />
          </div>
          
          {/* DELICATE TEXT & BUTTONS */}
          <div className="flex flex-col gap-8 md:max-w-md md:pb-6 shrink-0 text-right md:text-left items-start md:items-end">
            <Reveal delayMs={160} waitForPreloader={true}>
              <p className="text-[13px] md:text-[15px] font-light leading-relaxed tracking-widest text-white/70 uppercase text-left md:text-right">
                Hidden gems, premium guides, and trips you&apos;ll actually take -
                across the world&apos;s most unforgettable destinations.
              </p>
            </Reveal>
            <Reveal delayMs={240} waitForPreloader={true}>
              <div className="flex flex-wrap gap-4 justify-start md:justify-end">
                <Button asChild variant="gold" className="rounded-full px-10 py-8 text-[12px] md:text-[13px] uppercase tracking-[0.2em] font-medium transition-transform hover:scale-105">
                  <Link href={routes.explore}>Explore</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/20 bg-transparent backdrop-blur-sm px-10 py-8 text-[12px] md:text-[13px] uppercase tracking-[0.2em] font-medium text-white transition-all hover:bg-white/10 hover:border-white/40 hover:scale-105"
                >
                  <Link href="#featured">Discover</Link>
                </Button>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
