"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { JournalImage } from "@/features/journal/components/journal-image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface GalleryImage {
  id: string;
  storage_path: string;
  alt: string | null;
}

interface JournalGalleryProps {
  images: GalleryImage[];
  isSeed: boolean;
  journalTitle: string;
  className?: string;
}

export function JournalGallery({ images, isSeed, journalTitle, className }: JournalGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className={className || "grid grid-cols-2 gap-3 md:gap-4"}>
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(idx)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-surface-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <JournalImage
              path={img.storage_path}
              isSeed={isSeed}
              alt={img.alt ?? journalTitle}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent 
          showClose={false}
          className="max-w-none w-screen max-h-none h-screen inset-0 p-0 border-none bg-transparent shadow-none sm:rounded-none overflow-hidden flex items-center justify-center pointer-events-none"
        >
          <VisuallyHidden>
            <DialogTitle>Image Gallery</DialogTitle>
            <DialogDescription>Full screen view of the selected image</DialogDescription>
          </VisuallyHidden>
          
          {selectedIndex !== null && (
            <div 
              className="relative w-full h-full cursor-zoom-out pointer-events-auto"
              onClick={() => setSelectedIndex(null)}
            >
              <JournalImage
                path={images[selectedIndex].storage_path}
                isSeed={isSeed}
                alt={images[selectedIndex].alt ?? journalTitle}
                fill
                className="object-contain p-2 md:p-8"
                sizes="100vw"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
