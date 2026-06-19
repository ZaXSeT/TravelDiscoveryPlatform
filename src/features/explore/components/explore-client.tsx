"use client";

import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/features/explore/components/search-bar";
import { FilterPanel } from "@/features/explore/components/filter-panel";
import { DestinationGrid } from "@/features/explore/components/destination-grid";
import { Reveal } from "@/components/motion/reveal";
import {
  useExploreFilters,
  type ExploreItem,
} from "@/features/explore/use-explore-filters";

export function ExploreClient({ items }: { items: ExploreItem[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const f = useExploreFilters(items, { category: initialCategory });

  return (
    <div className="space-y-12">
      {/* Top Controls */}
      <Reveal delayMs={150} className="relative z-50">
        <div className="mx-auto max-w-5xl space-y-10 rounded-3xl border border-border/50 bg-background/80 p-6 shadow-xl backdrop-blur-xl sm:p-10">
          <SearchBar value={f.query} onChange={f.setQuery} />
          
          <div className="h-px w-full bg-border/50" />
          
          <FilterPanel
            region={f.region}
            setRegion={f.setRegion}
            category={f.category}
            setCategory={f.setCategory}
            sort={f.sort}
            setSort={f.setSort}
          />
        </div>
      </Reveal>

      {/* Grid Header & Results */}
      <div className="mx-auto max-w-7xl space-y-6">
        <Reveal delayMs={300}>
          <div className="flex items-center justify-between px-2">
            <p className="font-serif text-lg text-muted-foreground" aria-live="polite">
              <span className="text-foreground font-medium">{f.filtered.length}</span>{" "}
              {f.filtered.length === 1 ? "destination" : "destinations"} found
              {f.activeCount > 0 ? " for your search" : ""}
            </p>
            {f.activeCount > 0 && (
              <button
                type="button"
                onClick={f.reset}
                className="text-sm font-medium tracking-wide text-accent-gold transition-all hover:text-accent-gold/80 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </Reveal>

        <DestinationGrid items={f.filtered} onReset={f.reset} />
      </div>
    </div>
  );
}
