"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Leaflet is client-only and lazy-loaded so it never blocks first paint or SSR
// (03_RENDERING_AND_DATA_ARCHITECTURE.md §3, 08_PERFORMANCE_BUDGETS.md).
const LeafletMap = dynamic(
  () => import("@/features/destinations/components/leaflet-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="size-full" />,
  },
);

export function MapSection({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-lg border border-border md:h-[440px]">
      <LeafletMap lat={lat} lng={lng} name={name} />
    </div>
  );
}
