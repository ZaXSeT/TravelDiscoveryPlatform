import { PageContainer } from "@/components/layout/page-container";
import { LoadingState } from "@/components/feedback/loading-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-5 w-96 max-w-full" />
        <div className="mt-10">
          <LoadingState variant="grid" />
        </div>
      </PageContainer>
    </div>
  );
}
