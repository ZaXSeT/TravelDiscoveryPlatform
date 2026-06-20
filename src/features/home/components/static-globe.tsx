import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { InteractiveGlobe } from "@/features/globe/components/interactive-globe";
import { DESTINATIONS, ALL_DESTINATIONS } from "@/constants/destinations";
import { REGIONS } from "@/constants/categories";
import { routes } from "@/constants/routes";

// The globe plots every destination; this list highlights the featured (Tier 1) picks
// and links out to the full catalog. The list is the accessible, functional equivalent
// of the globe markers (09_ACCESSIBILITY_BASELINE.md §4).
export function StaticGlobe() {
  const total = ALL_DESTINATIONS.length;
  const regionCount = REGIONS.length;

  return (
    <section id="globe" data-theme="dark" className="section-y bg-dark-1 text-white">
      <PageContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-gold">
              The world, at a glance
            </p>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl">
              {total} destinations. One journey.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              From Bali&apos;s rice terraces to Cape Town&apos;s coast, explore{" "}
              {total} destinations across {regionCount} regions, with guides,
              budgets, and hidden gems.
            </p>

            <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-white/50">
              Featured
            </p>
            <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {DESTINATIONS.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={routes.destination(d.slug)}
                    className="group flex items-center justify-between py-4 transition-colors hover:text-accent-gold"
                  >
                    <span className="font-display text-xl">{d.name}</span>
                    <span className="flex items-center gap-2 text-sm text-white/60 group-hover:text-accent-gold">
                      {d.country}
                      <ArrowUpRight className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={routes.explore}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-gold transition-opacity hover:opacity-80"
            >
              Explore all {total} destinations
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <Reveal className="order-first lg:order-last">
            <InteractiveGlobe
              fallbackImageId="go/home/globe"
              alt={`Interactive globe marking ${total} destinations`}
            />
          </Reveal>
        </div>
      </PageContainer>
    </section>
  );
}
