"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { REGIONS, CATEGORIES, SORTS, type SortValue } from "@/constants/categories";
import { ChevronDown, Check } from "lucide-react";

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
        "relative shrink-0 overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
        active
          ? "bg-foreground text-background shadow-md"
          : "bg-surface-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground",
      )}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function CustomSortDropdown({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (val: SortValue) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSort = SORTS.find((s) => s.value === value) || SORTS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-48 items-center justify-between rounded-full border border-border/50 bg-surface-1 py-2 pl-5 pr-4 text-sm font-medium text-foreground outline-none transition-all duration-300 hover:bg-surface-2",
          isOpen && "border-accent-gold ring-1 ring-accent-gold"
        )}
      >
        <span>{selectedSort.label}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180 text-accent-gold"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-border/50 bg-background p-1 shadow-2xl animate-in fade-in zoom-in-95">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                onChange(s.value as SortValue);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2",
                value === s.value ? "font-bold text-accent-gold" : "font-medium text-muted-foreground"
              )}
            >
              {s.label}
              {value === s.value && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
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
    <div className="space-y-8">
      {/* Regions */}
      <div>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Explore by Region
        </h3>
        <div className="flex flex-wrap gap-2">
          <Chip active={!region} onClick={() => setRegion(null)}>
            Global
          </Chip>
          {REGIONS.map((r) => (
            <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
              {r}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        {/* Categories */}
        <div className="flex-1">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Travel Style
          </h3>
          <div className="flex flex-wrap gap-2">
            <Chip active={!category} onClick={() => setCategory(null)}>
              Any Style
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

        {/* Custom Sort Dropdown */}
        <div className="shrink-0 z-50">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Sort Experiences
          </h3>
          <CustomSortDropdown value={sort} onChange={setSort} />
        </div>
      </div>
    </div>
  );
}
