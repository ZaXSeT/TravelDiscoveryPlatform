import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { TripGeneratorClient } from "@/features/trip-generator/components/trip-generator-client";
import { CldImage } from "@/components/media/cld-image";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { getMyTravelDna } from "@/features/travel-dna/actions";
import { dnaToStyle } from "@/features/travel-dna/scoring";
import { ALL_DESTINATION_SLUGS } from "@/constants/destinations";

export const metadata: Metadata = {
  title: "AI Journey Builder",
  description:
    "AI-assisted trip planning grounded in ORBIS destination data and Travel DNA - generate a personalized, editable, savable itinerary with a route map.",
};

// Grounded AI generation takes ~30–40s; allow up to Vercel's free Hobby ceiling (60s) so
// the server action isn't killed at the default 10s. Our fetch aborts at 50s -> fallback
// still completes within this window.
export const maxDuration = 60;

export default async function TripGeneratorPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const travelDna = await getMyTravelDna();
  const defaultStyle = travelDna ? dnaToStyle(travelDna) : undefined;
  // Pre-select a destination when arriving from a Travel DNA match (?to=slug).
  const sp = await searchParams;
  const initialDestination =
    sp.to && (ALL_DESTINATION_SLUGS as readonly string[]).includes(sp.to)
      ? sp.to
      : undefined;
  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Hero Header */}
      <section
        data-theme="dark"
        className="relative flex min-h-[45svh] items-center overflow-hidden bg-dark-0 pt-8 md:pt-20 text-white"
      >
        <Parallax speed={0.15} className="absolute inset-x-0 -top-[20%] h-[140%]">
          <CldImage
            publicId="go/brand/globe-still"
            alt="Trip planning background"
            width={2560}
            height={1440}
            fill
            sizes="100vw"
            className="object-cover opacity-60"
          />
        </Parallax>
        
        {/* Clean dark overlay */}
        <div className="absolute inset-0 bg-dark-0/60" />

        <PageContainer width="full" className="relative z-10 w-full pt-8 pb-24 md:pt-16 md:pb-32">
          <Reveal>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white leading-[1]">
              Journey <span className="italic text-white/80">Builder</span>
            </h1>
          </Reveal>
          <Reveal delayMs={100}>
            <p className="mt-6 max-w-2xl text-lg md:text-xl font-light leading-relaxed text-white/70">
              AI-assisted planning, grounded in ORBIS destination data and Travel DNA.
              Set your budget, days, and style - Gemini drafts a personalized day-by-day
              route with real places, photos, and an estimated budget. Edit it, then save.
            </p>
          </Reveal>
        </PageContainer>
      </section>

      {/* Main Content overlapping the header */}
      <div className="relative z-20 -mt-16 pb-20 md:-mt-24">
        <PageContainer width="full">
          <TripGeneratorClient
            hasTravelDna={!!travelDna}
            defaultStyle={defaultStyle}
            initialDestination={initialDestination}
          />
        </PageContainer>
      </div>
    </div>
  );
}
