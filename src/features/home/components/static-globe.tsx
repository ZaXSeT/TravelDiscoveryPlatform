import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CldImage } from "@/components/media/cld-image";
import { PageContainer } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { DESTINATIONS } from "@/constants/destinations";
import { routes } from "@/constants/routes";

// Phase 2 ships the static globe (D2 / progressive enhancement). The interactive WebGL
// globe replaces the image in Phase 4. The destination list is the accessible, fully
// functional equivalent (09_ACCESSIBILITY_BASELINE.md §4) — never an image-only feature.
export function StaticGlobe() {
  return (
    <section
      id="globe"
      data-theme="dark"
      className="section-y bg-dark-1 text-white"
    >
      <PageContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-gold">
              The world, at a glance
            </p>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl">
              Five destinations. One journey.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              From Bali&apos;s rice terraces to the Swiss Alps — pick a place and
              dive into guides, budgets, and hidden gems.
            </p>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
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
          </div>

          <Reveal className="order-first lg:order-last">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border border-white/10 bg-dark-0 shadow-card">
              <CldImage
                publicId="go/home/globe"
                alt="A stylized globe highlighting featured destinations"
                width={800}
                height={800}
                fill
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="object-cover opacity-90"
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    "inset 0 0 80px rgba(200,169,126,0.25), 0 0 120px rgba(200,169,126,0.12)",
                }}
              />
            </div>
          </Reveal>
        </div>
      </PageContainer>
    </section>
  );
}
