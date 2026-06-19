import Link from "next/link";
import { CldImage } from "@/components/media/cld-image";
import { PageContainer } from "@/components/layout/page-container";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

// Phase 2 hero: static poster (LCP image) + premium type. Video + split-text land in
// Phase 4 (08_PERFORMANCE_BUDGETS.md: LCP is always a static image; mobile = image only).
export function Hero() {
  return (
    <section
      data-theme="dark"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-dark-0 text-white"
    >
      <CldImage
        publicId="go/home/hero"
        alt="A traveler looking out over a dramatic landscape at golden hour"
        width={1920}
        height={1280}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="scrim pointer-events-none absolute inset-0" />

      <PageContainer className="relative z-10 pt-24">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/80">
              Travel discovery, reimagined
            </p>
          </Reveal>
          <Reveal delayMs={80}>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Find the places worth the journey.
            </h1>
          </Reveal>
          <Reveal delayMs={160}>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              Hidden gems, premium guides, and trips you&apos;ll actually take —
              across five of the world&apos;s most unforgettable destinations.
            </p>
          </Reveal>
          <Reveal delayMs={240}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href={routes.explore}>Explore destinations</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/5 text-white hover:bg-white/15"
              >
                <Link href="#featured">Discover more</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </PageContainer>
    </section>
  );
}
