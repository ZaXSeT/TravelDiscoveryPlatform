import Link from "next/link";
import { Fingerprint, Wand2, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Reveal } from "@/components/motion/reveal";
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
    <section className="section-y bg-background">
      <PageContainer>
        <SectionHeader
          eyebrow="Plan smarter"
          title="Two ways to plan with AI"
          description="Discover your Travel DNA, then let the AI Journey Builder turn it into a real, editable trip - grounded in current, real-world places."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.href} delayMs={i * 100}>
              <Link
                href={f.href}
                className="group flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-accent-gold hover:shadow-xl"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-1 text-accent-goldText">
                  <f.Icon className="size-6" />
                </div>
                <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-accent-goldText">
                  {f.eyebrow}
                </p>
                <h3 className="mt-2 font-display text-2xl sm:text-3xl">{f.title}</h3>
                <p className="mt-3 flex-1 text-muted-foreground">{f.desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  {f.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
