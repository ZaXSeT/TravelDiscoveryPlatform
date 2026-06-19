"use client";

import { cn } from "@/lib/utils";
import { REGIONS, CATEGORIES, SORTS, type SortValue } from "@/constants/categories";

interface FilterPanelProps {
  region: string | null;
  setRegion: (value: string | null) => void;
  category: string | null;
  setCategory: (value: string | null) => void;
  sort: SortValue;
  setSort: (value: SortValue) => void;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-pill border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-accent-gold",
      )}
    >
      {children}
    </button>
  );
}

export function FilterPanel({
  region,
  setRegion,
  category,
  setCategory,
  sort,
  setSort,
}: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Region
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={!region} onClick={() => setRegion(null)}>
            All
          </Chip>
          {REGIONS.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
              {r}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Category
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <Chip active={!category} onClick={() => setCategory(null)}>
              All
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <label
            htmlFor="sort"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="h-11 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
