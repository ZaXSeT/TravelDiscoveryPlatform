import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/feedback/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function ItinerariesLoading() {
  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-4 h-5 w-96 max-w-full" />
        <div className="mt-8 space-y-8">
          <Skeleton className="h-40 w-full rounded-lg" />
          <LoadingState variant="list" count={3} />
        </div>
      </PageContainer>
    </div>
  );
}
