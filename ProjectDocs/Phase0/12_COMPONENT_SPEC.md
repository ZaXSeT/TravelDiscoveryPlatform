# 12 — Base Component Specification

Contracts for the shared/base components named in
[12_COMPONENT_STANDARDS](../12_COMPONENT_STANDARDS.txt), plus the cross-cutting
state components Product Realism requires. **Props/behavior only — no code.** Every
section-level component must support **loading / error / empty** states.

Conventions: presentation components are pure (no data fetching); they receive data +
callbacks. Animation is injected via wrappers from `components/motion/*`, never baked in
([15_CODE_STANDARDS](../15_CODE_STANDARDS.txt)).

---

## 1. Layout & structure

### PageContainer
- Purpose: consistent max-width, gutters, vertical rhythm.
- Props: `as?` (semantic tag), `width?: 'default' | 'wide' | 'full'`, `paddingY?: bool`, `children`.

### SectionHeader
- Purpose: editorial section title + optional eyebrow/description/action.
- Props: `eyebrow?`, `title`, `description?`, `align?: 'left'|'center'`, `action?: ReactNode`.

### Header / MobileMenu
- Header: transparent over hero, glass on scroll, sticky; auth-aware (guest vs user nav).
- Props: `variant?: 'transparent'|'solid'` (auto via scroll), session info.
- MobileMenu: fullscreen overlay; focus-trapped; `Esc`/overlay close; reduced-motion aware.

---

## 2. State components (Product Realism)

### LoadingState / Skeleton
- Purpose: section + page skeletons; never a bare spinner for whole pages.
- Props: `variant: 'card'|'grid'|'list'|'detail'|'text'`, `count?`.

### EmptyState
- Purpose: editorial empty states (wishlist, itineraries, journal, search-no-results).
- Props: `icon?`, `title`, `description`, `action?` (CTA), `illustration?`.

### ErrorState
- Purpose: section-level error with retry; pairs with React error boundaries.
- Props: `title?`, `description?`, `onRetry?`, `compact?`.

### AnimatedReveal (motion)
- Purpose: scroll/entrance reveal wrapper (GSAP-driven via ScrollProvider).
- Props: `as?`, `variant?: 'fade'|'rise'|'image'|'split'`, `delay?`, `stagger?`, `once?`.
- Reduced motion: resolves to instant/opacity-only.

---

## 3. Destination domain

### DestinationCard
- Purpose: grid/featured card (image, name, country, DNA hint, save affordance).
- Props: `destination` (summary shape), `onSave?` (triggers wishlist add / auth gate),
  `saved?: bool`, `priority?: bool` (LCP image), `size?: 'sm'|'md'|'lg'`.
- States: image loading (skeleton), hover lift (motion), saved toggle (optimistic).

### TravelDNACard / DnaRadar
- Purpose: radar chart of 6 DNA axes + animated reveal.
- Props: `dna: { adventure, culture, food, nature, nightlife, budgetFriendly }`,
  `compareWith?` (optional second destination), `animate?: bool`.
- A11y: provides a text table equivalent of the values (not chart-only).

### BudgetCard
- Purpose: accommodation/food/transport/total, elegant presentation.
- Props: `budget: { accommodation, food, transport }` (cents/day), `days?` (scales total),
  `currency: 'USD'`.
- Behavior: formats cents → currency via util; recomputes total when `days` changes.

### GallerySection
- Props: `images: CloudinaryImage[4]`, layout variant; lazy + responsive; lightbox optional.

### HiddenGems
- Props: `gems: { title, description, image }[]`; premium editorial cards.

### NearbyList / RelatedDestinations
- NearbyList props: `items: { name, distanceKm, image }[]`.
- RelatedDestinations props: `current: slug`, `items: DestinationSummary[]`.

### MapSection
- Purpose: Leaflet/OSM map for a destination (lazy, `ssr:false`).
- Props: `center: {lat,lng}`, `markers?`, `zoom?`, `staticFallbackSrc?`.
- Mobile/perf: may render a static map image if budget exceeded ([08_PERFORMANCE_BUDGETS](08_PERFORMANCE_BUDGETS.md)).

---

## 4. Globe (signature)

### Globe (client, ssr:false, desktop only)
- Props: `destinations: { slug, name, lat, lng }[]`, `onSelect(slug)`, `autoRotate?`.
- Behavior: atmosphere glow, markers, hover flight arcs, smooth camera; render-on-demand.
- Gating: mounts only when capability + viewport checks pass; otherwise `GlobeFallback`.

### GlobeFallback
- Props: `imageSrc`, `destinations` (for the accessible list/markers overlay).
- Always available on mobile and as the error/no-WebGL fallback; carries the same
  destination links so functionality is preserved.

---

## 5. Explore

### SearchBar
- Props: `value`, `onChange`, `placeholder?`; debounced; clears; accessible label.

### FilterPanel
- Props: `filters` (region, budget tier, DNA emphasis, style), `onChange`, `onReset`.
- Operates client-side over the 5 static destinations; keyboard operable.

### DestinationGrid
- Props: `destinations`, `onSave`, `savedSet`, `loading?`, `emptyAction?`.
- States: loading (skeleton grid), empty (no matches → reset CTA).

---

## 6. Itinerary

### Planner / Timeline / DayColumn / ItemCard / BudgetSummary
- Planner: orchestrates days + items; optimistic CRUD via feature actions.
- DayColumn props: `day`, `items`, `onAddItem`, `onReorder`, `onEditItem`, `onDeleteItem`.
- ItemCard props: `item` (title, startTime, cost, note, destinationLink), edit/delete.
- BudgetSummary props: `items`/`total` (cents) → formatted; updates live.
- Reorder: **tap/button reorder is the baseline (mobile-first + a11y); drag is a
  desktop-only enhancement.** Never drag-only — mobile usability is a hard requirement.
- Persistence: every add/edit/delete/reorder is a persisted Server Action; **reload
  shows the saved plan** (CRUDR Refresh gate).
- States: empty (no days), per-mutation loading/error with rollback.

---

## 7. Trip Generator

### GeneratorForm
- Props: `defaults?`, `onGenerate(input)`; fields budget/days/style/(optional destination);
  inline validation per [06_DATA_CONTRACTS](06_DATA_CONTRACTS.md).

### ResultPreview
- Props: `result` (generated day/item plan + estimated budget), `onSave` (gate if guest),
  `onRegenerate`.
- States: computing (brief, honest), result, empty/invalid input guarded upstream.

---

## 8. Journal

### JournalFeed / JournalCard
- Feed props: `entries` (seed + public user), `loading?`, `emptyAction?`.
- Card props: `entry` (cover, title, excerpt, authorLabel, destination?, date).

### JournalEditor
- Props: `mode: 'create'|'edit'`, `initial?`, `onSubmit`, `onSaveDraft`, `onPublish`.
- Markdown body (sanitized server-side), cover + gallery via ImageUploader.
- States: saving, per-image upload progress, validation errors, publish confirm.

### ImageUploader
- Props: `bucket`, `accept`, `maxSizeMB=5`, `onUploaded(path)`, `multiple?`.
- Behavior: requests signed upload, shows progress, isolates per-image failure, captures `alt`.

---

## 9. Profile (connected hub)

Profile is the ecosystem hub (demo Step 8) — it lists the user's actual content, not
just counts.

### ProfileHeader
- avatar (upload via ImageUploader → `avatars` bucket), display name, bio; edit inline.

### StatsRow
- wishlist / itinerary / journal counts (accent summary only).

### ProfileWishlist / ProfileItineraries / ProfileJournals (lists)
- Each renders the user's owned rows with links to the relevant page
  (destination / planner / journal view+edit). Journals list includes drafts/private.
- Each has its own loading / empty / error state.
- All server-fetched → persists on refresh (CRUDR Refresh gate).

---

## 10. Auth

### AuthModal + SignInForm / SignUpForm / ResetForm
- AuthModal props: `open`, `onClose`, `intent?` (pending-intent for replay), `returnTo?`.
- Forms: validated per contracts; submitting/error states; neutral messaging (no enumeration).
- On success: replays pending intent ([02_USER_AND_AUTH_FLOWS](02_USER_AND_AUTH_FLOWS.md) §4).
- Focus-trapped; `Esc` closes; restores focus.

---

## Cross-cutting rules
- Every list/grid/section component accepts/handles `loading`, `error`, `empty`.
- No component fetches data or holds business logic inline (separation per code standards).
- All interactive components are keyboard-accessible with visible focus.
- Components stay < 300 lines; split into subcomponents when exceeded.
