import Link from "next/link";
import Image from "next/image";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export function CtaSection() {
  return (
    <section
      data-theme="dark"
      className="relative flex min-h-[85svh] items-center justify-center overflow-hidden bg-dark-0 text-white"
    >
      <Parallax speed={0.15} className="absolute inset-x-0 -top-[15%] h-[130%]">
        <Image
          src="/images/EoguZ.jpg"
          alt="A breathtaking view of Mount Fuji with cherry blossoms inspiring your next journey"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </Parallax>
      
      {/* Gradients to ensure text is readable and bleeds nicely into footer */}
      <div className="scrim pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-0/95 via-dark-0/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dark-0/30 via-transparent to-transparent" />

      <PageContainer className="relative z-10 w-full py-24 text-center">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-[0.25em] text-accent-gold">
              The World Awaits
            </span>
          </Reveal>
          
          <Reveal delayMs={100}>
            <h2 className="mt-8 font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl lg:text-[6rem]">
              Your next trip<br />starts here.
            </h2>
          </Reveal>
          
          <Reveal delayMs={200}>
            <p className="mt-8 max-w-xl text-lg text-white/80 leading-relaxed md:text-xl">
              Explore destinations now — create a free account to save favorites and
              plan itineraries that you will remember forever.
            </p>
          </Reveal>
          
          <Reveal delayMs={300}>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button asChild variant="gold" size="lg" className="h-14 px-8 text-base shadow-xl">
                <Link href={routes.explore}>Start exploring</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base border-white/30 bg-white/5 text-white backdrop-blur-md hover:bg-white/20 hover:text-white transition-colors"
              >
                <Link href={routes.signUp}>Create account</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </PageContainer>
    </section>
  );
}
