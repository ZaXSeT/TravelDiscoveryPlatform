# 04 — Database Schema (Specification)

Full schema for Supabase Postgres. This is the **contract**, not migration code —
columns, types, constraints, keys, indexes, and relationships are fixed here; Phase 1
authors the actual migrations + RLS ([05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md)).

Conventions (from [10_DATABASE_SPEC](../10_DATABASE_SPEC.txt) + review):
- **UUID** primary keys (`gen_random_uuid()` / `uuid`).
- Every table has `created_at timestamptz NOT NULL DEFAULT now()` and
  `updated_at timestamptz NOT NULL DEFAULT now()` (updated by trigger).
- User-owned rows reference `auth.users(id)` via a `user_id` column.
- **Soft delete:** journals only (`deleted_at timestamptz NULL`). All others hard-delete
  with `ON DELETE CASCADE` from their parent.
- All monetary values are **integers in minor units (cents)**, currency fixed `USD`
  (single-currency scope). Avoids float rounding.
- Naming: `snake_case`, plural tables.

Entity overview:
```
auth.users (Supabase) 1───1 profiles
auth.users 1───* wishlists ───* destinations
auth.users 1───* itineraries 1───* itinerary_days 1───* itinerary_items
auth.users 1───* journals 1───* journal_images
destinations (static-seeded, read-only at runtime)
```

---

## enums

| Enum | Values | Used by |
|------|--------|---------|
| `travel_style` | `adventure`, `culture`, `food`, `nature`, `luxury` | trip generator input, itinerary meta |
| `journal_visibility` | `private`, `public` | journals |
| `itinerary_source` | `manual`, `generated` | itineraries (tracks AI-generated trips) |

(`region` and `category` for destinations are stored as text on the seeded dataset; no
enum needed since destinations are static.)

---

## profiles
1:1 with `auth.users`. Created automatically by trigger on user signup.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, **FK → auth.users(id) ON DELETE CASCADE** | Same id as auth user. |
| `display_name` | text | NOT NULL, 2–50 chars (check) | From sign-up. |
| `avatar_path` | text | NULL | Path in Supabase Storage `avatars` bucket (not a public URL). |
| `bio` | text | NULL, ≤ 280 chars (check) | Optional. |
| `created_at` | timestamptz | NOT NULL default now() | |
| `updated_at` | timestamptz | NOT NULL default now() | trigger-maintained |

- **Trigger:** `on_auth_user_created` → insert into `profiles (id, display_name)`
  using `new.id` and `new.raw_user_meta_data->>'display_name'` (fallback to email local-part).
- Indexes: PK only.

---

## destinations
Static, seeded, **read-only at runtime** (no CRUD per D1/D5). Holds the canonical row
each user item references. Render-time content also lives in the typed dataset
([07_MEDIA…](07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md)); seed keeps them in sync by slug.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | Stable across reseeds (seed uses fixed UUIDs). |
| `slug` | text | NOT NULL, **UNIQUE** | `bali`,`tokyo`,`paris`,`new-york`,`switzerland`. |
| `name` | text | NOT NULL | Display name. |
| `country` | text | NOT NULL | |
| `region` | text | NOT NULL | e.g. `Asia`, `Europe`, `North America`. |
| `summary` | text | NOT NULL | Short editorial blurb. |
| `latitude` | double precision | NOT NULL | For map + globe markers. |
| `longitude` | double precision | NOT NULL | |
| `dna_adventure` | smallint | NOT NULL, 0–100 (check) | Travel DNA. |
| `dna_culture` | smallint | NOT NULL, 0–100 | |
| `dna_food` | smallint | NOT NULL, 0–100 | |
| `dna_nature` | smallint | NOT NULL, 0–100 | |
| `dna_nightlife` | smallint | NOT NULL, 0–100 | |
| `dna_budget_friendly` | smallint | NOT NULL, 0–100 | Higher = cheaper. |
| `budget_accommodation` | integer | NOT NULL | Cents/day, USD. |
| `budget_food` | integer | NOT NULL | Cents/day. |
| `budget_transport` | integer | NOT NULL | Cents/day. |
| `created_at` / `updated_at` | timestamptz | NOT NULL | |

- Gallery images, hero, video, hidden gems, nearby attractions, travel tips are
  **content** delivered via the typed dataset + Cloudinary (not normalized into tables;
  they are static and presentation-only). This keeps the DB lean and the editorial
  content versioned in code.
- Indexes: `UNIQUE(slug)`.
- RLS: **public read; no write** (see security doc).

---

## wishlists
A user's saved destinations (join of user × destination).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK default gen_random_uuid() | |
| `user_id` | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner. |
| `destination_id` | uuid | NOT NULL, FK → destinations(id) ON DELETE CASCADE | |
| `created_at` / `updated_at` | timestamptz | NOT NULL | |

- **Constraint:** `UNIQUE(user_id, destination_id)` → idempotent saves (supports the
  guest→user intent replay no-op).
- Indexes: `UNIQUE(user_id, destination_id)`, index on `user_id`.

---

## itineraries
Top-level trip plan. May be user-built or AI-generated (then saved).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `user_id` | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Owner. |
| `title` | text | NOT NULL, 1–120 chars | |
| `destination_id` | uuid | NULL, FK → destinations(id) ON DELETE SET NULL | Optional primary destination. |
| `source` | itinerary_source | NOT NULL default `manual` | `generated` when from trip generator. |
| `style` | travel_style | NULL | Captured when generated. |
| `total_budget` | integer | NOT NULL default 0 | Cents; denormalized sum of items, maintained app-side. |
| `start_date` | date | NULL | Optional. |
| `created_at` / `updated_at` | timestamptz | NOT NULL | |

- Indexes: index on `user_id`, `created_at desc`.

## itinerary_days
Ordered days within an itinerary.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `itinerary_id` | uuid | NOT NULL, FK → itineraries(id) ON DELETE CASCADE | |
| `day_index` | smallint | NOT NULL, ≥ 1 | Display order (Day 1, Day 2…). |
| `title` | text | NULL, ≤ 120 chars | Optional label. |
| `created_at` / `updated_at` | timestamptz | NOT NULL | |

- **Constraint:** `UNIQUE(itinerary_id, day_index)`.
- Ownership for RLS is resolved via parent `itineraries.user_id` (see security doc).
- Indexes: index on `itinerary_id`.

## itinerary_items
Activities within a day.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `day_id` | uuid | NOT NULL, FK → itinerary_days(id) ON DELETE CASCADE | |
| `position` | smallint | NOT NULL, ≥ 0 | Order within day. |
| `title` | text | NOT NULL, 1–160 chars | |
| `start_time` | time | NULL | Optional. |
| `cost` | integer | NOT NULL default 0 | Cents. |
| `note` | text | NULL, ≤ 500 chars | |
| `destination_id` | uuid | NULL, FK → destinations(id) ON DELETE SET NULL | Optional link. |
| `created_at` / `updated_at` | timestamptz | NOT NULL | |

- Indexes: index on `day_id`.

---

## journals
User & seed travel stories. **Soft-deletable.**

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `user_id` | uuid | NULL, FK → auth.users(id) ON DELETE CASCADE | NULL for seed entries. |
| `is_seed` | boolean | NOT NULL default false | Seed/editorial entry. |
| `author_label` | text | NOT NULL | Display author; seeds use "GO Editorial". |
| `slug` | text | NOT NULL, **UNIQUE** | Shareable URL. |
| `title` | text | NOT NULL, 1–140 chars | |
| `excerpt` | text | NULL, ≤ 280 chars | Feed preview. |
| `body` | text | NOT NULL | Sanitized rich text/markdown (see security §6). |
| `cover_path` | text | NULL | Storage path (`journal-media` bucket) or Cloudinary id for seeds. |
| `destination_id` | uuid | NULL, FK → destinations(id) ON DELETE SET NULL | Optional. |
| `visibility` | journal_visibility | NOT NULL default `private` | `public` to appear in feed. |
| `published_at` | timestamptz | NULL | Set when first published. |
| `deleted_at` | timestamptz | NULL | Soft delete. |
| `created_at` / `updated_at` | timestamptz | NOT NULL | |

- **Public feed predicate:** `visibility = 'public' AND deleted_at IS NULL`
  (seeds satisfy this).
- Indexes: `UNIQUE(slug)`, index on `user_id`, partial index on
  `(visibility, deleted_at, published_at desc)` for feed queries.

## journal_images
Images attached to a journal (gallery). User uploads → Supabase Storage.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `journal_id` | uuid | NOT NULL, FK → journals(id) ON DELETE CASCADE | |
| `storage_path` | text | NOT NULL | Path in `journal-media` bucket (or Cloudinary id for seeds). |
| `position` | smallint | NOT NULL default 0 | Order. |
| `alt` | text | NULL, ≤ 160 chars | Accessibility. |
| `created_at` / `updated_at` | timestamptz | NOT NULL | |

- Indexes: index on `journal_id`.

---

## Ownership resolution for RLS (summary)

| Table | Owner expression |
|-------|------------------|
| profiles | `id = auth.uid()` |
| wishlists | `user_id = auth.uid()` |
| itineraries | `user_id = auth.uid()` |
| itinerary_days | parent `itineraries.user_id = auth.uid()` (via EXISTS) |
| itinerary_items | grandparent `itineraries.user_id = auth.uid()` (via EXISTS join through days) |
| journals | `user_id = auth.uid()` (write); public read predicate above |
| journal_images | parent `journals.user_id = auth.uid()` (write) |
| destinations | public read; no write |

Full policy predicates in [05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md) §3.

---

## Triggers & integrity

| Trigger | Purpose |
|---------|---------|
| `set_updated_at` (all tables) | `updated_at = now()` on UPDATE. |
| `on_auth_user_created` | Create `profiles` row on new auth user. |
| Budget denormalization | `itineraries.total_budget` recomputed in the Server Action that mutates items (app-side, single transaction) rather than DB trigger, to keep logic in one validated place. |

## Indexing rationale
- All FK columns used in filters are indexed (`user_id`, `journal_id`, `day_id`,
  `itinerary_id`).
- Feed query is the only "hot" public query → partial composite index on journals.
- Destination lookups are by `slug` (unique index).
