"use client";

import Link from "next/link";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthNav } from "@/features/auth/components/auth-nav";
import { useUiStore } from "@/stores/use-ui-store";
import { routes } from "@/constants/routes";
import { siteConfig } from "@/constants/config";

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  const allLinks = [{ href: routes.home, label: "Home" }, ...links];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="inset-0 flex h-full w-full flex-col gap-10 p-6 pt-8 data-[state=open]:animate-fade-in">
        <DialogTitle asChild>
          <span className="font-display text-xl font-semibold">
            {siteConfig.name}
          </span>
        </DialogTitle>
        <VisuallyHidden.Root>
          <DialogDescription>Site navigation</DialogDescription>
        </VisuallyHidden.Root>

        <nav aria-label="Mobile" className="flex flex-col">
          {allLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-4 font-display text-3xl tracking-tight transition-colors hover:text-accent-goldText"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <AuthNav variant="menu" onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
