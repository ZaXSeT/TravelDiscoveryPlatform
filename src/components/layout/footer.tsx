import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { routes } from "@/constants/routes";
import { siteConfig } from "@/constants/config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-1">
      <PageContainer className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Discover destinations worth the journey — hidden gems, premium guides,
            and trips you&apos;ll actually take.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-8 gap-y-3 text-sm"
        >
          <Link
            href={routes.home}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href={routes.explore}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </Link>
          <Link
            href={routes.signIn}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
        </nav>
      </PageContainer>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. A travel discovery
        experience.
      </div>
    </footer>
  );
}
