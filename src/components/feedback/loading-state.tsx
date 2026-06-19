import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant: "grid" | "list" | "detail" | "card";
  count?: number;
  className?: string;
}

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-lg" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function LoadingState({ variant, count = 6, className }: LoadingStateProps) {
  if (variant === "grid") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
          className,
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div aria-busy="true" className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return <CardSkeleton />;
  }

  // detail
  return (
    <div aria-busy="true" className={cn("space-y-6", className)}>
      <Skeleton className="h-[40vh] w-full rounded-lg" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
