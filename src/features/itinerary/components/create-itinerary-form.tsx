"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createItinerary } from "@/features/itinerary/actions";
import { ALL_DESTINATIONS } from "@/constants/destinations";

export function CreateItineraryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destinationSlug, setDestinationSlug] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Custom dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const res = await createItinerary({
        title: title.trim(),
        destinationSlug: destinationSlug || null,
      });
      if (!res.ok) {
        setError(res.error.message);
        if (res.error.fields) setFieldErrors(res.error.fields);
        return;
      }
      router.push(`/itineraries/${res.data.id}`);
    } finally {
      setPending(false);
    }
  };

  const selectedName = destinationSlug 
    ? ALL_DESTINATIONS.find(d => d.slug === destinationSlug)?.name 
    : "Anywhere";

  return (
    <form
      onSubmit={submit}
      className="py-12 md:py-16"
    >
      <div className="flex flex-col gap-2 mb-12 md:mb-16">
        <h2 className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-accent-gold-text">
          Begin a new journey
        </h2>
        <p className="font-serif text-3xl md:text-5xl lg:text-6xl text-primary font-light tracking-tight">
          Where to next?
        </p>
      </div>
      
      {error && (
        <p role="alert" className="mb-8 text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-end">
        
        {/* TRIP NAME INPUT */}
        <div className="space-y-4 group">
          <Label htmlFor="trip-title" className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-medium group-focus-within:text-accent-gold-text transition-colors">
            Give it a name
          </Label>
          <Input
            id="trip-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer in Kyoto"
            required
            aria-invalid={fieldErrors.title ? true : undefined}
            className="h-auto py-2 w-full rounded-none border-0 border-b-2 border-black/10 bg-transparent px-0 text-2xl md:text-4xl font-serif font-light placeholder:text-black/20 focus-visible:border-black focus-visible:ring-0 transition-all"
          />
          {fieldErrors.title && (
            <p className="text-sm text-destructive mt-2">{fieldErrors.title}</p>
          )}
        </div>

        {/* CUSTOM PREMIUM DROPDOWN */}
        <div className="space-y-4 group relative" ref={dropdownRef}>
          <Label className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-medium group-focus-within:text-accent-gold-text transition-colors">
            Choose destination
          </Label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between h-auto py-2 w-full rounded-none border-0 border-b-2 border-black/10 bg-transparent px-0 text-2xl md:text-4xl font-serif font-light focus:outline-none focus:border-black transition-all"
          >
            <span className={destinationSlug ? "text-primary" : "text-black/30"}>
              {selectedName}
            </span>
            <motion.div 
              animate={{ rotate: isOpen ? 180 : 0 }} 
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            >
              <ChevronDown className="size-6 md:size-8 opacity-30" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                className="absolute top-[calc(100%+8px)] left-0 z-50 w-full max-h-[60vh] overflow-y-auto overscroll-contain rounded-2xl border border-black/5 bg-white/95 backdrop-blur-2xl shadow-[0_30px_60px_rgb(0,0,0,0.12)] p-2"
                data-lenis-prevent="true"
              >
                <div 
                  onClick={() => { setDestinationSlug(""); setIsOpen(false); }}
                  className="font-serif text-lg md:text-xl font-light text-black/60 hover:bg-black/5 hover:text-black cursor-pointer py-4 px-4 rounded-xl transition-colors"
                >
                  Anywhere
                </div>
                {ALL_DESTINATIONS.map((d) => (
                  <div 
                    key={d.slug}
                    onClick={() => { setDestinationSlug(d.slug); setIsOpen(false); }}
                    className="font-serif text-lg md:text-xl font-light hover:bg-black/5 hover:text-black cursor-pointer py-4 px-4 rounded-xl transition-colors"
                  >
                    {d.name}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      
      {/* BUTTON */}
      <div className="mt-12 md:mt-16 flex justify-start">
        <Button 
          type="submit" 
          disabled={pending} 
          variant="default"
          className="rounded-full bg-primary px-10 py-8 text-[11px] md:text-xs uppercase tracking-[0.25em] text-white font-medium transition-transform hover:scale-105 hover:bg-black gap-3"
        >
          <Plus className="size-4" />
          {pending ? "Crafting..." : "Create Itinerary"}
        </Button>
      </div>
    </form>
  );
}
