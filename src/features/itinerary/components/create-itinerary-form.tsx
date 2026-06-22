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
      className="py-8 md:py-12 w-full"
    >
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-accent-goldText">
          Begin a new journey
        </h2>
        <p className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Where to next?
        </p>
      </div>
      
      {error && (
        <p role="alert" className="mb-6 text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
          {error}
        </p>
      )}

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-black/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* TRIP NAME INPUT */}
          <div className="space-y-3 group">
            <Label htmlFor="trip-title" className="text-sm font-medium text-foreground">
              Give it a name
            </Label>
            <Input
              id="trip-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer in Kyoto"
              required
              aria-invalid={fieldErrors.title ? true : undefined}
              className="h-14 w-full rounded-xl bg-surface/50 border-black/10 px-4 text-lg placeholder:text-black/30 focus-visible:bg-surface focus-visible:border-black/30 focus-visible:ring-0 transition-all"
            />
            {fieldErrors.title && (
              <p className="text-sm text-destructive mt-2">{fieldErrors.title}</p>
            )}
          </div>

          {/* CUSTOM PREMIUM DROPDOWN */}
          <div className="space-y-3 group relative" ref={dropdownRef}>
            <Label className="text-sm font-medium text-foreground">
              Choose destination
            </Label>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between h-14 w-full rounded-xl bg-surface/50 border border-black/10 px-4 text-lg focus:outline-none focus:bg-surface focus:border-black/30 transition-all text-left"
            >
              <span className={destinationSlug ? "text-primary" : "text-black/30"}>
                {selectedName}
              </span>
              <motion.div 
                animate={{ rotate: isOpen ? 180 : 0 }} 
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="size-5 opacity-40" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-[calc(100%+8px)] left-0 z-50 w-full max-h-[300px] overflow-y-auto overscroll-contain rounded-xl border border-black/5 bg-white shadow-lg p-2"
                  data-lenis-prevent="true"
                >
                  <div 
                    onClick={() => { setDestinationSlug(""); setIsOpen(false); }}
                    className="text-base font-medium text-muted-foreground hover:bg-black/5 hover:text-black cursor-pointer py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Anywhere
                  </div>
                  {ALL_DESTINATIONS.map((d) => (
                    <div 
                      key={d.slug}
                      onClick={() => { setDestinationSlug(d.slug); setIsOpen(false); }}
                      className="text-base font-medium hover:bg-black/5 hover:text-black cursor-pointer py-2.5 px-4 rounded-lg transition-colors"
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
        <div className="mt-10 pt-8 border-t border-black/5 flex justify-end">
          <Button 
            type="submit" 
            disabled={pending} 
            variant="gold"
            className="rounded-full px-8 py-6 text-sm font-medium transition-transform hover:scale-105 gap-2"
          >
            <Plus className="size-4" />
            {pending ? "Crafting..." : "Create Itinerary"}
          </Button>
        </div>
      </div>
    </form>
  );
}
