"use client";

import Link from "next/link";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -15 },
  show: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  },
};

export function MobileMenu({ links }: MobileMenuProps) {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  const allLinks = [{ href: routes.home, label: "Home" }, ...links];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="fixed inset-0 flex h-dvh w-dvw flex-col !rounded-none bg-background p-8 data-[state=open]:animate-fade-in border-none">
        <DialogTitle asChild>
          <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Menu
          </span>
        </DialogTitle>
        <VisuallyHidden.Root>
          <DialogDescription>Site navigation</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex flex-1 flex-col justify-center">
          <motion.nav 
            aria-label="Mobile" 
            className="flex flex-col items-center gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {allLinks.map((l) => (
              <motion.div key={l.href} variants={itemVariants}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-4xl md:text-5xl font-medium tracking-tight text-foreground transition-colors hover:text-accent-gold"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        </div>

        <div className="mt-auto border-t border-border pt-8 pb-4">
          <AuthNav variant="menu" onNavigate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
