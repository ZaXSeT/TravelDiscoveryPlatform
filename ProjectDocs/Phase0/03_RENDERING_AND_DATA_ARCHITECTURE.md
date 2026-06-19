# 03 — Rendering & Data Architecture (ADR)

This is an Architecture Decision Record. It fixes **how each route renders** and
**how data flows** so the SEO ≥95 / Performance ≥90 targets ([03_ARCHITECTURE](../03_ARCHITECTURE.txt))
are reachable and so frontend work in Phase 2+ builds against a stable data layer.

---

## 1. Rendering strategy per route

Principle: **static/cacheable for public content, dynamic for per-user data.** Public
content (the 5 destinations, journal feed) is the SEO/perf surface and must be
pre-rendered. Private content is rendered per request behind auth.

| Route | Strategy | Revalidate | Rationale |
|-------|----------|-----------|-----------|
| `/` | **Static (SSG)** | build / on deploy | Hero, featured, categories are static. Globe is a client island hydrated after load. |
| `/explore` | **SSG** + client-side filtering | build | 5 destinations ship as static data; filtering is instant client-side. No server round-trips. |
| `/destinations/[slug]` | **SSG (generateStaticParams)** | build | 5 known slugs; fully static editorial pages. Best LCP + SEO. |
| `/trip-generator` | **SSG shell** + client engine | build | Engine runs client-side (deterministic). Save = server action. |
| `/journal` | **ISR** | 60s | Mixes seed + published user journals; must refresh as users publish. |
| `/journal/[slug]` | **ISR** + `generateStaticParams` for seeds | 60s | Seeds pre-rendered; user entries rendered on demand then cached. |
| `/journal/new`, `/journal/[slug]/edit` | **Dynamic (SSR, no cache)** | — | Auth + owner; form pages. |
| `/wishlist`, `/itineraries`, `/itineraries/[id]`, `/profile` | **Dynamic (SSR, no cache)** | — | Per-user data behind auth; never cached at CDN. |
| `/auth/*` | **Dynamic** | — | Session-aware. |

Notes:
- "Static data for destinations" = a typed dataset (see [07_MEDIA…](07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md)
  `assets.ts` + content constants) that is **also seeded into Postgres** so user
  content (wishlist/itinerary items) can reference a `destination_id` FK. The static
  copy is the *render source*; the DB row is the *referential anchor*. They share the
  same `slug` and are kept in sync by the seed script (single authoring source →
  generates both). See [04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md) §destinations.

---

## 2. Data layer ADR

### Decision
- **Reads of public content:** from the static dataset (no DB call at request time).
- **Reads of user content:** Server Components using the **Supabase server client**
  (cookie auth) — data fetched on the server, never exposing service keys.
- **Writes (mutations):** **Next.js Server Actions** as the default mutation channel.
  - Server Actions give built-in CSRF protection, run with the user's RLS context, and
    keep the Supabase client server-side.
  - Route Handlers (`app/api/*`) are used **only** where a non-form HTTP endpoint is
    required (e.g. Supabase Storage signed-upload token issuance, `sitemap.xml`).
- **Client state:** **Zustand** for ephemeral UI/session state only
  (auth modal open, pending-intent, optimistic wishlist set, planner local edits).
  No server data is cached long-term on the client.
- **No TanStack Query / SWR** in scope: with SSG public data + Server Actions, a client
  data-cache layer is unnecessary complexity. Revisit only if a real-time need appears.

### Why not client-side Supabase SDK for reads/writes?
- Keeps anon key usage minimal and avoids scattering query logic + RLS assumptions in
  the browser. Server Actions centralize mutations, validation (contracts), and error
  shaping. Trade-off: slightly more server code; benefit: security + testability.

### Mutation contract (uniform shape)
Every Server Action:
1. Authenticates (session required for `[auth]` actions).
2. Validates input against the matching contract in [06_DATA_CONTRACTS](06_DATA_CONTRACTS.md).
3. Executes via Supabase server client (RLS enforces ownership).
4. Returns a typed result `{ ok: true, data } | { ok: false, error }`.
5. Triggers `revalidatePath`/`revalidateTag` for affected cached routes (e.g. publishing
   a journal revalidates `/journal`).

### Optimistic UI rules
- Wishlist add/remove and planner item edits are optimistic with rollback on
  `{ ok: false }`. All optimistic actions are **idempotent** server-side.

---

## 3. Client/server boundary (islands)

Heavy interactive pieces are **client components dynamically imported** and isolated so
they never block first paint of static content:

| Island | Load rule |
|--------|-----------|
| Interactive Globe (Three.js/R3F) | `dynamic(() => …, { ssr: false })`, **desktop only** (D2), mounted after hero in view; mobile renders static fallback image. |
| Hero background video | Poster image is the LCP element; video lazy-attached after load; image-only on mobile (see [08_PERFORMANCE_BUDGETS](08_PERFORMANCE_BUDGETS.md)). |
| Leaflet map (destination) | `ssr: false`, lazy on scroll into view. |
| Travel DNA radar | Lightweight; client component, lazy when in view. |
| Scroll storytelling (GSAP) | Client; registered once via a single scroll provider (§4). |

Everything else (layout, nav, cards, content sections) is **Server Components** by
default per [15_CODE_STANDARDS](../15_CODE_STANDARDS.txt).

---

## 4. Scroll & animation integration (single source of truth)

To avoid the Lenis ⇄ GSAP ⇄ Framer Motion conflicts flagged in the architecture review:

- **One `ScrollProvider`** (client) owns the Lenis instance and drives GSAP
  `ScrollTrigger` via Lenis's RAF (`ScrollTrigger.update` on Lenis `scroll`,
  `lenis.raf` in a single ticker). No component creates its own Lenis.
- **Framer Motion** is used for *page/route transitions and discrete hover/tap*
  interactions only — never for scroll-linked motion (that is GSAP's domain). This
  removes the responsibility overlap and bundle duplication risk.
- **Reduced motion:** the provider reads `prefers-reduced-motion`; when set, Lenis is
  disabled (native scroll) and GSAP reveals resolve to instant/opacity-only. See
  [09_ACCESSIBILITY_BASELINE](09_ACCESSIBILITY_BASELINE.md).
- **App Router:** scroll restoration handled by the provider; route changes reset Lenis
  to top unless navigating to an in-page anchor.

---

## 5. Caching & revalidation summary

| Trigger | Action |
|---------|--------|
| Deploy | Rebuild all SSG routes. |
| Journal published/unpublished/edited | `revalidatePath('/journal')` + `revalidatePath('/journal/[slug]')`. |
| User mutations (wishlist/itinerary/profile) | No CDN cache (dynamic routes); UI updates optimistically + via re-fetch. |
| Destination data change | Requires redeploy (static) — acceptable since destinations are fixed (D1). |

---

## 6. Persistence guarantee (mandatory acceptance gate)

Persistence-after-refresh is the headline success metric ([09_PRODUCT_REALISM](../09_PRODUCT_REALISM.txt))
and the **R** in the CRUDR gate. The data layer is designed so the database is always the
source of truth on reload:

- **All authenticated pages render from server-fetched DB data** (SSR, no cache). A full
  page refresh re-reads the user's rows under their RLS context → whatever was saved is
  shown. There is **no client-only state that holds canonical data.**
- **Optimistic UI is intentionally minimal** and is a display convenience only (wishlist
  toggle, planner item edits). On any failure it rolls back; on refresh the server value
  wins. Optimistic state is never the only place a value lives.
- **Every mutation is a persisted Server Action** ([§2](#2-data-layer-adr)) that writes to
  Postgres before returning success. UI does not show "saved" until the write succeeds.
- **Zustand stores hold only ephemeral UI state** (modal open, pending-intent, in-flight
  optimistic set) — explicitly *not* user content. They are allowed to vanish on refresh.

Per-feature verification (run at the Phase 3 gate and the Phase 5 e2e): for wishlist,
itinerary (+days/+items), journal, and profile — **create/update/delete → hard refresh →
assert the change is still present** (or absent, for delete), on both mobile and desktop.
