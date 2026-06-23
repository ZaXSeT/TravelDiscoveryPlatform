import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { CldImage } from "@/components/media/cld-image";
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
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-gold">
              The world, at a glance
            </p>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl">
              {total} destinations. One journey.
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              From Bali&apos;s rice terraces to Cape Town&apos;s coast, explore{" "}
              {total} destinations across {regionCount} regions, with guides,
              budgets, and hidden gems.
            </p>

            <p className="mt-10 mb-4 text-xs font-medium uppercase tracking-[0.18em] text-white/50">
              Featured
            </p>
            <ul className="mt-4 flex flex-col">
              {DESTINATIONS.map((d) => (
                <li key={d.slug} className="border-b border-white/10 last:border-0">
                  <Link
                    href={routes.destination(d.slug)}
                    className="group flex items-center justify-between py-5 transition-all duration-500 hover:pl-3"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-[1.25rem] border border-white/5 opacity-90 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:border-accent-gold/30">
                        <CldImage
                          publicId={d.media.thumbnail}
                          alt={d.name}
                          width={120}
                          height={120}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="block font-display text-xl sm:text-2xl transition-colors duration-500 group-hover:text-accent-gold">
                          {d.name}
                        </span>
                        <span className="block mt-1 text-xs font-medium tracking-wide text-white/50 transition-colors duration-500 group-hover:text-white/80">
                          {d.country}
                        </span>
                      </div>
                    </div>
                    <div className="flex size-10 shrink-0 -translate-x-4 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                      <ArrowRight className="size-4" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={routes.explore}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-accent-gold"
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
