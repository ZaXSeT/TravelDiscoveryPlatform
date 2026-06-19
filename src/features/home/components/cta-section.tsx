import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export function CtaSection() {
  return (
    <section data-theme="dark" className="bg-dark-0 text-white">
      <PageContainer className="section-y text-center">
        <h2 className="mx-auto max-w-2xl font-display text-4xl lg:text-5xl">
          Your next trip starts here.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-white/80">
          Explore destinations now — create a free account to save favorites and
          plan itineraries.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href={routes.explore}>Start exploring</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-white/5 text-white hover:bg-white/15"
          >
            <Link href={routes.signUp}>Create account</Link>
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
