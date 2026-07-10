"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="mr-2 size-4" />
      Back
    </Button>
  );
}
