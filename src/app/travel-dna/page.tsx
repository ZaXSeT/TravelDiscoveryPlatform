import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { CldImage } from "@/components/media/cld-image";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { TravelDnaClient } from "@/features/travel-dna/components/travel-dna-client";
import { getMyTravelDna } from "@/features/travel-dna/actions";

export const metadata: Metadata = {
  title: "Travel DNA",
  description:
    "Discover your Travel DNA — a personalized traveler profile matched against every ORBIS destination and used to power AI-assisted itineraries.",
};

export default async function TravelDnaPage() {
  const initialDna = await getMyTravelDna();

  return (
    <div className="min-h-screen bg-background">
      <section
        data-theme="dark"
        className="relative flex min-h-[42svh] items-center overflow-hidden bg-dark-0 pt-20 text-white"
      >
        <Parallax speed={0.15} className="absolute inset-x-0 -top-[20%] h-[140%]">
          <CldImage
            publicId="go/brand/globe-still"
            alt="Travel DNA background"
            width={2560}
            height={1440}
            fill
            sizes="100vw"
            className="object-cover opacity-50"
          />
        </Parallax>
        <div className="absolute inset-0 bg-dark-0/60" />

        <PageContainer className="relative z-10 w-full pt-16 pb-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">
              Innovation · Personalization
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl lg:text-6xl">
              Travel DNA
            </h1>
          </Reveal>
          <Reveal delayMs={100}>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              A traveler profile that learns what you love, scores every destination against
              it, and feeds the AI Journey Builder so your itineraries feel made for you.
            </p>
          </Reveal>
        </PageContainer>
      </section>

      <div className="relative z-20 -mt-14 pb-20 md:-mt-20">
        <PageContainer>
          <TravelDnaClient initialDna={initialDna} />
        </PageContainer>
      </div>
    </div>
  );
}
