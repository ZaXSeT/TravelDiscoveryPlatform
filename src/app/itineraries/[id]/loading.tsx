import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlannerLoading() {
  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-10 w-72 max-w-full" />
        <Skeleton className="mt-6 h-24 w-full rounded-lg" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </PageContainer>
    </div>
  );
}
