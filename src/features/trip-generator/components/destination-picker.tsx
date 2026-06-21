"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  slug: string;
  name: string;
}

export function DestinationPicker({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const selectedLabel =
    value === ""
      ? "Auto-pick for my style"
      : (options.find((o) => o.slug === value)?.name ?? "Select destination");

  const updateCoords = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updateCoords();
      // Use true for capture phase to catch scrolls on any scrollable container
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      // Close if clicking outside both the trigger and the portal dropdown
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Use capture phase (true) so Radix UI or other components can't stop propagation before we see the click
    document.addEventListener("pointerdown", onDoc, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDoc, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      // Focus input on next tick after portal mounts
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.name.toLowerCase().includes(q))
    : options;

  const select = (slug: string) => {
    onChange(slug);
    setOpen(false);
  };

  const rowClass = (selected: boolean) =>
    cn(
      "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
      selected && "font-medium text-accent-goldText",
    );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>

      {open && coords && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: coords.top + 8, left: coords.left, width: coords.width }}
          className="absolute z-[9999] animate-in fade-in zoom-in-95 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/10"
        >
          <div className="flex items-center gap-2 border-b border-border/60 px-3 bg-surface-1/50">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations…"
              className="h-10 w-full border-none bg-transparent text-sm shadow-none outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
          <ul data-lenis-prevent className="max-h-64 overflow-y-auto overscroll-contain p-1.5 custom-scrollbar">
            {!q && (
              <li>
                <button
                  type="button"
                  onClick={() => select("")}
                  className={rowClass(value === "")}
                >
                  Auto-pick for my style
                  {value === "" && <Check className="size-4" />}
                </button>
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.slug}>
                <button
                  type="button"
                  onClick={() => select(o.slug)}
                  className={rowClass(value === o.slug)}
                >
                  {o.name}
                  {value === o.slug && <Check className="size-4" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                No destinations match “{query}”.
              </li>
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}
