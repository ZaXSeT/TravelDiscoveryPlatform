# 01 — Information Architecture

Defines the sitemap, navigation model, and the complete route table. The route
table is the contract that [03_RENDERING_AND_DATA_ARCHITECTURE](03_RENDERING_AND_DATA_ARCHITECTURE.md)
attaches a rendering + data strategy to.

---

## 1. Sitemap

```
/ (Home — cinematic)
├── /explore                         Explore (search + filters + grid)
├── /destinations/[slug]             Destination detail (5 static: bali, tokyo, paris, new-york, switzerland)
├── /trip-generator                  AI Trip Generator (rule-based)
│
├── /wishlist                        [auth] Saved destinations
├── /itineraries                     [auth] Itinerary list
│   └── /itineraries/[id]            [auth, owner] Itinerary planner (timeline + budget)
├── /journal                         Journal feed (public read; seeded + user entries)
│   ├── /journal/[slug]              Journal detail (public read)
│   ├── /journal/new                 [auth] Create journal
│   └── /journal/[slug]/edit         [auth, owner] Edit journal
├── /profile                         [auth] User info, stats, recent activity
│
├── /auth/sign-in                    Sign in
├── /auth/sign-up                    Sign up
├── /auth/reset                      Request password reset
├── /auth/update-password            Set new password (from email link)
├── /auth/callback                   Supabase auth callback (code exchange)
│
└── system: /not-found, /error, /sitemap.xml, /robots.txt, /opengraph-image
```

Legend: `[auth]` requires a session; `[owner]` additionally requires row ownership
(enforced by RLS — see [05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md)).

> Removed vs. original docs: no `/admin`, no destination create/edit routes (D1, D5).

---

## 2. Navigation model

### Primary nav (desktop)
- Behavior per [02_DESIGN_SYSTEM](../02_DESIGN_SYSTEM.txt): transparent over hero,
  glass on scroll, sticky.
- Left: brand/logo → `/`.
- Center: `Explore`, `Trip Generator`, `Journal`.
- Right (guest): `Sign in` (button, accent).
- Right (user): `Wishlist`, avatar menu → `Profile`, `Itineraries`, `Sign out`.

### Mobile nav
- Fullscreen overlay menu (per design system). Same links, stacked, large type.
- No globe in nav-triggered transitions; respects reduced-motion.

### Auth-gated affordances (not hidden — gated)
Guest sees Wishlist/Save/Itinerary CTAs but triggering them opens the **auth gate**
(see [02_USER_AND_AUTH_FLOWS](02_USER_AND_AUTH_FLOWS.md) §4). Affordances are never
fake (Product Realism): a guest "Save" prompts sign-in, then completes the save.

### Breadcrumb / back affordance
- Destination, itinerary, and journal detail pages provide a back-to-list affordance.
- No deep breadcrumb trees (editorial, not dashboard — [08_AWWWARDS_REFERENCES](../08_AWWWARDS_REFERENCES.txt)).

---

## 3. Complete route table

| Route | Access | Page sections (from [11_UI_PAGES_SPEC](../11_UI_PAGES_SPEC.txt)) | Notes |
|-------|--------|------------------------------------------------------------------|-------|
| `/` | Public | Hero, Globe, Featured, Categories, Inspiration, CTA | Globe desktop-only (D2). |
| `/explore` | Public | Search, Filters, Destination grid | Filters operate on 5 static destinations. |
| `/destinations/[slug]` | Public | Hero, Overview, Travel DNA, Budget, Gallery, Hidden Gems, Nearby, Map, Related | 5 valid slugs; others → 404. |
| `/trip-generator` | Public | Input form, generated itinerary preview, "Save" (gated) | Rule-based (D4). Save requires auth. |
| `/wishlist` | Auth | Saved destinations, quick actions | Empty state designed. |
| `/itineraries` | Auth | List of user itineraries, create CTA | Empty state designed. |
| `/itineraries/[id]` | Auth + owner | Planner, timeline (days/items), budget summary | RLS-guarded. |
| `/journal` | Public | Journal feed (seeded + published user entries) | See visibility model below. |
| `/journal/[slug]` | Public | Journal detail (cover, body, images) | Only `published` + non-deleted shown publicly. |
| `/journal/new` | Auth | Create form | Draft on create. |
| `/journal/[slug]/edit` | Auth + owner | Edit form | RLS-guarded. |
| `/profile` | Auth | User info, saved stats, recent activity | Own profile only. |
| `/auth/*` | Public | Auth screens | Redirect to `/` (or `returnTo`) when already signed in. |

---

## 4. Journal visibility model (resolves Phase-review ambiguity)

The original docs pre-populate sample journals *and* allow user journals in the same
feed, risking "whose content is this?". Resolution:

- `journals.visibility ∈ {private, public}` and `journals.is_seed boolean`.
- **Public feed (`/journal`)** shows: seeded journals + user journals where
  `visibility = public AND deleted_at IS NULL`.
- Author attribution is always shown (seed entries use a neutral "GO Editorial" author).
- A user's **own** drafts/private entries appear only in their `/profile` activity and
  edit screens, never in the public feed.

This keeps the feed "alive before users create content" (Competition goal) without
identity confusion.

---

## 5. Entity → URL contract

| Entity | Public identifier | Reasoning |
|--------|-------------------|-----------|
| Destination | `slug` (e.g. `new-york`) | SEO-friendly, stable, static set. |
| Journal | `slug` (unique) | SEO-friendly, shareable. |
| Itinerary | `id` (uuid) | Private; not SEO; no slug needed. |
| Profile | none (self only) | No public profiles in scope. |

Slugs are immutable once seeded/published to preserve shareable URLs.
