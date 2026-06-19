"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative group max-w-2xl">
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-accent-gold/40 to-accent-blue/40 opacity-0 blur transition duration-500 group-hover:opacity-100" />
      
      {/* Floating Glassmorphic Container */}
      <div className="relative flex items-center rounded-full border border-border/50 bg-background/70 shadow-lg backdrop-blur-xl transition-all focus-within:bg-background/90 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-accent-gold/20">
        <Search
          className="ml-6 size-5 text-muted-foreground transition-colors group-focus-within:text-accent-gold"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search destinations, countries, or vibes…"
          aria-label="Search destinations"
          className="h-16 w-full flex-1 appearance-none bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-transparent focus:outline-none focus:ring-0"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="mr-3 flex size-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
