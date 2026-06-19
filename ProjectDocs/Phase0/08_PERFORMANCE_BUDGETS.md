# 08 — Performance Budgets

Targets from [03_ARCHITECTURE](../03_ARCHITECTURE.txt): Lighthouse **Performance ≥90,
A11y ≥95, Best Practices ≥95, SEO ≥95**. Per project directive, **mobile performance is
a first-class constraint** and the globe/video degrade on mobile (D2).

These budgets are gates checked in Phase 2/3 (per-route) and Phase 5 (final).

---

## 1. Core Web Vitals targets

| Metric | Mobile target | Desktop target |
|--------|---------------|----------------|
| LCP | ≤ 2.5 s | ≤ 2.0 s |
| INP | ≤ 200 ms | ≤ 200 ms |
| CLS | ≤ 0.05 | ≤ 0.05 |
| TBT (lab) | ≤ 200 ms | ≤ 150 ms |

Tested on Lighthouse mobile preset (throttled) and a mid-tier device profile, not just a
fast laptop.

---

## 2. Per-route JS budget (gzipped, route-level JS shipped to client)

| Route | Budget (mobile) | Notes |
|-------|-----------------|-------|
| `/` | ≤ 180 KB initial; globe chunk lazy (desktop only) | Hero is static; globe excluded from mobile + from initial. |
| `/explore` | ≤ 150 KB | Client filtering only. |
| `/destinations/[slug]` | ≤ 170 KB; map + radar lazy | Map/radar load on scroll. |
| `/trip-generator` | ≤ 160 KB | Rule engine is small, pure functions. |
| `/journal`, `/journal/[slug]` | ≤ 150 KB | Mostly static content. |
| auth/user routes | ≤ 150 KB | Forms + lists. |

Shared baseline (framework + Lenis + shared UI) must stay lean; **Framer Motion and GSAP
are code-split** and not in the global critical path where avoidable. Globe stack
(Three.js/R3F/Drei) is **never** in any mobile bundle.

---

## 3. Asset budgets

| Asset | Budget |
|-------|--------|
| Hero poster (LCP image) | ≤ 200 KB (AVIF/WebP, responsive) |
| Hero video (desktop only) | ≤ 2.5 MB, ≤ 10 s loop, muted, H.264+WebM |
| Destination gallery image | ≤ 150 KB each (responsive `srcset`) |
| Globe textures total (desktop only) | ≤ 3 MB combined, compressed (KTX2 preferred) |
| Each web font (subset, woff2) | ≤ 35 KB; ≤ 3 families total |
| Any single user upload | ≤ 5 MB (enforced) then downscaled |

---

## 4. Mobile degradation rules (D2)

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Hero | video background + poster | **static poster image only** (no video fetch) |
| Globe | interactive Three.js (lazy, on-view) | **static globe image** (Cloudinary still) + optional CSS shimmer; no WebGL |
| Scroll storytelling | full GSAP parallax/pin | reduced parallax; pinning simplified; honors reduced-motion |
| Map | Leaflet interactive (lazy) | Leaflet lazy; or static map image if perf budget exceeded |
| Flight paths | animated arcs | static or omitted |

Detection: server-side viewport hint where possible + a client capability check
(`matchMedia`, `prefers-reduced-motion`, pointer/coarse, `deviceMemory`/`hardwareConcurrency`
heuristics). WebGL is gated behind a capability + width check; fallback renders if unmet.

---

## 5. Loading strategy (avoid "blank until heavy thing loads")

- **LCP is always a static image** (hero poster), painted before any video/WebGL.
- Globe, map, radar, video are **client islands** loaded after first paint /
  on-view (`dynamic`, `IntersectionObserver`).
- Route-level skeletons for grid/list/sections (Product Realism loading states).
- Fonts: preloaded + `swap`; reserve space to keep CLS ≈ 0.
- No layout shift from images: explicit `width`/`height` or aspect-ratio boxes.
- Globe chunk uses Suspense with a static fallback so it never blocks interaction
  ([14_ANIMATION_SYSTEM](../14_ANIMATION_SYSTEM.txt): animation never blocks interaction).

---

## 6. Rendering choices that protect the budget

- Public content is **SSG/ISR** ([03_RENDERING_AND_DATA_ARCHITECTURE](03_RENDERING_AND_DATA_ARCHITECTURE.md))
  → fast TTFB + cacheable + great SEO.
- No client data-fetching library; Server Actions for mutations only.
- Single animation provider; GSAP for scroll, Framer Motion only for transitions/hover
  (no duplicated scroll engines).

---

## 7. Demo resilience (live judge flow)

- Pre-warm prod before demo; seed data present so no empty states block the journey.
- Error boundaries per section; a failed island (e.g. map) never white-screens the page.
- Globe failure → fallback image (already the mobile path), so even a GPU-less projector
  is safe.

---

## 8. Verification

- Per-route Lighthouse (mobile + desktop) recorded at the Phase 2/3 gates.
- Bundle analysis to enforce JS budgets (fail the gate if exceeded).
- Phase 5: final Lighthouse on all public routes + the Playwright judge-flow e2e.
