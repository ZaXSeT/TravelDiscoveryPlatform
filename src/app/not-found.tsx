import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
      <p className="font-display text-6xl text-accent-goldText">404</p>
      <h1 className="mt-4 font-display text-3xl">This page wandered off</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you
        back on the map.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={routes.home}>Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.explore}>Explore destinations</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
