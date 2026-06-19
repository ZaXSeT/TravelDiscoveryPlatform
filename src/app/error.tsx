"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState } from "@/components/feedback/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Monitoring hook (Sentry) is optional per D6; log for now.
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="flex min-h-[60vh] items-center justify-center pb-20 pt-28">
      <div className="w-full max-w-lg">
        <ErrorState onRetry={reset} />
      </div>
    </PageContainer>
  );
}
