import { cn } from "@/lib/utils";

/**
 * Orbis brand mark — a background-free wireframe globe + orbit, drawn in
 * `currentColor` so it inherits the header wordmark's colour (white over the hero,
 * ink on the glass header). No tile/badge — it sits transparently next to "Orbis".
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
    >
      {/* orbit ring */}
      <ellipse
        cx="16"
        cy="16"
        rx="12.5"
        ry="5.2"
        transform="rotate(-30 16 16)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* satellite on the orbit */}
      <circle cx="27" cy="9.7" r="1.9" fill="currentColor" />
      {/* globe */}
      <circle cx="16" cy="16" r="6.3" stroke="currentColor" strokeWidth="1.5" />
      {/* meridian + equator */}
      <ellipse cx="16" cy="16" rx="2.6" ry="6.3" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.75" />
      <line x1="9.9" y1="16" x2="22.1" y2="16" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.75" />
    </svg>
  );
}
