"use client";

import { useMemo, useState } from "react";
import type { DestinationSummary } from "@/types";
import type { SortValue } from "@/constants/categories";

export interface ExploreItem extends DestinationSummary {
  budgetPerDay: number; // cents
}

interface InitialFilters {
  category?: string | null;
}

export function useExploreFilters(
  items: ExploreItem[],
  initial?: InitialFilters,
) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(
    initial?.category ?? null,
  );
  const [sort, setSort] = useState<SortValue>("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((d) => {
      const matchesQuery =
        q.length === 0 ||
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q);
      const matchesRegion = !region || d.region === region;
      const matchesCategory = !category || d.categories.includes(category);
      return matchesQuery && matchesRegion && matchesCategory;
    });

    const sorted = [...list];
    switch (sort) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "budget-asc":
        sorted.sort((a, b) => a.budgetPerDay - b.budgetPerDay);
        break;
      case "budget-desc":
        sorted.sort((a, b) => b.budgetPerDay - a.budgetPerDay);
        break;
      default:
        break; // "featured" keeps source order
    }
    return sorted;
  }, [items, query, region, category, sort]);

  const activeCount =
    (query ? 1 : 0) + (region ? 1 : 0) + (category ? 1 : 0);

  const reset = () => {
    setQuery("");
    setRegion(null);
    setCategory(null);
    setSort("featured");
  };

  return {
    query,
    setQuery,
    region,
    setRegion,
    category,
    setCategory,
    sort,
    setSort,
    filtered,
    activeCount,
    reset,
  };
}
