import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function DestinationLoading() {
  return (
    <div>
      <Skeleton className="h-[72svh] w-full rounded-none" />
      <PageContainer className="section-y space-y-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-4 w-5/6 max-w-prose" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full max-w-[320px] rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </PageContainer>
    </div>
  );
}
