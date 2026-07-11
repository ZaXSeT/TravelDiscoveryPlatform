"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <ArrowLeft className="mr-2 size-4" />
      Back
    </Button>
  );
}
