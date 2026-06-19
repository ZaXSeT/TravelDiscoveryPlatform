"use client";

import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/features/explore/components/search-bar";
import { FilterPanel } from "@/features/explore/components/filter-panel";
import { DestinationGrid } from "@/features/explore/components/destination-grid";
import {
  useExploreFilters,
  type ExploreItem,
} from "@/features/explore/use-explore-filters";

// Client orchestrator. Filtering runs entirely client-side over the 5 static
// destinations — no server round-trips (03_RENDERING_AND_DATA_ARCHITECTURE.md).
export function ExploreClient({ items }: { items: ExploreItem[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const f = useExploreFilters(items, { category: initialCategory });

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <SearchBar value={f.query} onChange={f.setQuery} />
        <FilterPanel
          region={f.region}
          setRegion={f.setRegion}
          category={f.category}
          setCategory={f.setCategory}
          sort={f.sort}
          setSort={f.setSort}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {f.filtered.length}{" "}
          {f.filtered.length === 1 ? "destination" : "destinations"}
          {f.activeCount > 0 ? " · filtered" : ""}
        </p>
        {f.activeCount > 0 && (
          <button
            type="button"
            onClick={f.reset}
            className="text-sm font-medium text-accent-goldText hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <DestinationGrid items={f.filtered} onReset={f.reset} />
    </div>
  );
}
