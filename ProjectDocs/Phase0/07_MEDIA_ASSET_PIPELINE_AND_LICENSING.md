# 07 — Media, Asset Pipeline & Licensing

Implements D3: **Cloudinary = editorial destination media; Supabase Storage = user
uploads.** Also defines the typed asset registry (`assets.ts`) required by
[06_ASSETS_AND_CONTENT](../06_ASSETS_AND_CONTENT.txt) and the licensing plan.

---

## 1. Media ownership boundary (unambiguous)

| Media | Pipeline | Why |
|-------|----------|-----|
| Destination hero / thumbnail / gallery / video | **Cloudinary** | Fixed editorial set (5 destinations). Cloudinary handles transforms, responsive delivery, format negotiation (AVIF/WebP), and CDN. |
| Globe textures (`earth-day`, `earth-bump`, `earth-clouds`, `stars`) | **`/public` (self-hosted, build-time optimized)** | Loaded by Three.js as raw textures; not user-facing images; benefit from being same-origin and pre-compressed (KTX2/Basis). |
| Seed journal cover/images | **Cloudinary** | Editorial seed content. |
| User journal covers + gallery | **Supabase Storage** (`journal-media`) | User-generated; secured by Storage RLS + signed URLs ([05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md) §4). |
| User avatars | **Supabase Storage** (`avatars`) | User-generated. |
| UI/static (logos, icons, OG fallback) | **`/public`** | Tiny, same-origin. |

Rule: **editorial = Cloudinary, user-generated = Supabase Storage, engine textures &
chrome = `/public`.** No overlap.

---

## 2. Cloudinary delivery contract

- Single cloud (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`). Public IDs follow:
  `go/destinations/{slug}/{kind}` where `kind ∈ {hero, thumb, gallery-1..4}` and
  `go/destinations/{slug}/video`.
- Delivery via `next/image` with a **Cloudinary loader** so every image is:
  - format `f_auto` (AVIF/WebP), quality `q_auto`, responsively sized (`w_` per breakpoint).
- Video: deliver an MP4 (H.264) + WebM where possible; **poster image is a Cloudinary
  still** and is the LCP element (see [08_PERFORMANCE_BUDGETS](08_PERFORMANCE_BUDGETS.md)).
- Uploads to Cloudinary are **not** a runtime user feature — editorial media is uploaded
  once (manually or via a one-off signed script using server-only secrets). No client
  Cloudinary upload widget in scope.

---

## 3. Supabase Storage contract (user uploads)

See [05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md) §4 for buckets, path-prefix RLS, and
validation. Summary:
- Private buckets `avatars`, `journal-media`; access via **signed URLs** issued after an
  ownership/visibility check.
- Client requests a signed upload from a Route Handler (validates auth + constraints),
  uploads directly to Storage, then the path is persisted on the row.
- Images normalized to `.webp` on upload where feasible; max 5 MB; UUID filenames.

---

## 4. `assets.ts` — typed single source of truth

Per [06_ASSETS_AND_CONTENT](../06_ASSETS_AND_CONTENT.txt): **no hardcoded paths**;
single source; easy replacement. Specification (shape only — authored in Phase 1):

- `src/constants/assets.ts` exports a typed registry keyed by destination slug:
  - `hero`, `thumbnail`, `gallery: [4]`, `video`, `videoPoster` → Cloudinary public IDs.
  - `textures` (globe) → `/public/textures/*` paths.
  - `og` / brand → `/public` paths.
- A helper resolves Cloudinary public ID → URL with transform params (kept in one place).
- The **seed script** and the **render layer** both import from this registry +
  `src/constants/destinations.ts` (content: name, country, DNA, budget, hidden gems,
  tips, nearby, coordinates). This is the **authoring source** that:
  1. Renders the static destination pages.
  2. Seeds the `destinations` table (same `slug` + fixed UUIDs) so user content can FK.

Result: one place to author destination content & media; DB and UI cannot drift.

---

## 5. Destination content model (static)

Editorial fields that live in `destinations.ts` (presentation-only, not normalized into
DB tables — [04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md) note):

| Field | Shape |
|-------|-------|
| identity | `slug, name, country, region, summary, coordinates {lat,lng}` |
| dna | `{ adventure, culture, food, nature, nightlife, budgetFriendly }` 0–100 |
| budget | `{ accommodation, food, transport }` cents/day |
| travelTips | `string[]` |
| hiddenGems | `{ title, description, image }[]` |
| nearby | `{ name, distanceKm, image }[]` |
| gallery | 4 × Cloudinary IDs |
| media | `hero, thumbnail, video, videoPoster` |

The DB `destinations` row stores the subset needed for FKs + queries (identity, coords,
dna, budget). Rich editorial arrays stay in code.

---

## 6. Licensing & attribution (mandatory for public submission)

Using unlicensed media on an Awwwards/FWA/public submission risks disqualification and
legal exposure. Rules:

- **Only** use media that is license-clear for commercial/portfolio public display:
  - Photos/video: Unsplash, Pexels, Pixabay (license permits free commercial use), or
    self-shot, or properly purchased stock.
  - Globe textures: NASA Visible Earth / Blue Marble (public domain) or clearly-licensed
    equivalents.
  - Fonts: confirm Clash Display & Satoshi (Fontshare — free license) and Inter (OFL)
    license terms; self-host within license.
- **Attribution registry:** `ProjectDocs/Phase0/ASSET_CREDITS.md` (created in Phase 1)
  lists every asset → source URL → author → license. One row per asset.
- No scraping of competitor sites or copyrighted travel-brand imagery.
- Replaceability: because all paths route through `assets.ts`, any asset flagged for
  licensing can be swapped in one place.

---

## 7. Optimization rules (cross-ref performance)

- Images: `f_auto,q_auto`, responsive `sizes`, `next/image` with width/height to prevent
  CLS, `priority` only on the hero LCP image.
- Video: compressed, short loop, `preload="none"` until poster painted; **disabled on
  mobile** (image hero) per D2/performance budgets.
- Globe textures: compressed (KTX2/Basis or resized JPG/PNG ≤ target sizes in
  [08_PERFORMANCE_BUDGETS](08_PERFORMANCE_BUDGETS.md)); loaded only on desktop.
- Fonts: subset, `font-display: swap`, preloaded, self-hosted (simplifies CSP).
