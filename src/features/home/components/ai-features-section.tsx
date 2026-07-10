import Link from "next/link";
import { Fingerprint, Wand2, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { routes } from "@/constants/routes";

const FEATURES = [
  {
    href: routes.travelDna,
    Icon: Fingerprint,
    eyebrow: "Step 1 · Personalization",
    title: "Discover your Travel DNA",
    desc: "Answer a few quick questions to reveal your traveler profile and see which destinations match you best.",
    cta: "Take the assessment",
  },
  {
    href: routes.tripGenerator,
    Icon: Wand2,
    eyebrow: "Step 2 · AI-assisted",
    title: "AI Journey Builder",
    desc: "Turn your taste into a personalized, day-by-day itinerary with real places, a route map, and a budget - then save and edit it.",
    cta: "Build a trip",
  },
];

// Home spotlight for the two flagship AI features - makes them discoverable from the
// landing page and shows how they connect (DNA → Builder).
export function AiFeaturesSection() {
  return (
    // Use pb-24 md:pb-32 instead of section-y to remove the double top padding since it shares a background with the previous section
    <section className="pb-24 md:pb-32 bg-background">
      <PageContainer>
        <SectionHeader
          eyebrow="Plan smarter"
          title="Two ways to plan with AI"
          description="Discover your Travel DNA, then let the AI Journey Builder turn it into a real, editable trip - grounded in current, real-world places."
        />
        <div className="mt-8 -mx-4 flex flex-row overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:mt-10 md:grid md:grid-cols-2 md:overflow-visible md:snap-none md:pb-0 md:gap-6">
          {FEATURES.map((f, i) => (
            <Reveal 
              key={f.href} 
              delayMs={i * 100}
              className={cn(
                "shrink-0 snap-start w-[85vw] max-w-[340px] md:w-full md:max-w-none flex flex-col",
                "ml-4 md:ml-0",
                i === FEATURES.length - 1 ? "mr-4 md:mr-0" : ""
              )}
            >
              <Link
                href={f.href}
                className="group relative flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-border/50 bg-card p-8 md:p-10 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-accent-gold/30 hover:shadow-2xl hover:shadow-accent-gold/5"
              >
                {/* Subtle background glow effect on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-gold/0 to-transparent transition-colors duration-500 group-hover:from-accent-gold/5" />
                <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-accent-gold/5 blur-3xl transition-all duration-500 group-hover:bg-accent-gold/15" />
                
                <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-surface-1 text-accent-gold transition-transform duration-500 group-hover:scale-110">
                  <f.Icon className="size-6" />
                </div>
                <p className="relative z-10 mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold/80">
                  {f.eyebrow}
                </p>
                <h3 className="relative z-10 mt-3 font-display text-2xl sm:text-3xl text-foreground transition-colors duration-500 group-hover:text-accent-gold">{f.title}</h3>
                <p className="relative z-10 mt-4 flex-1 text-muted-foreground leading-relaxed">{f.desc}</p>
                <span className="relative z-10 mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors duration-500 group-hover:text-accent-gold">
                  {f.cta}
                  <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
