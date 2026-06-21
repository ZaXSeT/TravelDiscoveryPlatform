"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoutePoint } from "@/features/trip-generator/components/trip-route-leaflet";

const Leaflet = dynamic(
  () => import("@/features/trip-generator/components/trip-route-leaflet"),
  { ssr: false, loading: () => <Skeleton className="size-full" /> },
);

export function TripRouteMap({ points }: { points: RoutePoint[] }) {
  if (points.length === 0) return null;
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-border md:h-[460px]">
      <Leaflet points={points} />
    </div>
  );
}
