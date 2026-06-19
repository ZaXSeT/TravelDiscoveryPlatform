# Backend & Data (Phase 1)

Supabase backend for the Travel Discovery Platform. Implements the Phase 0 contracts:
[04_DATABASE_SCHEMA](../ProjectDocs/Phase0/04_DATABASE_SCHEMA.md),
[05_SECURITY_AND_RLS](../ProjectDocs/Phase0/05_SECURITY_AND_RLS.md),
[06_DATA_CONTRACTS](../ProjectDocs/Phase0/06_DATA_CONTRACTS.md),
[07_MEDIA…](../ProjectDocs/Phase0/07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md).

> Phase 1 ships the **database layer**. The executable Zod contracts and Supabase
> client factories are authored in Phase 2 (they are TypeScript and live in the app
> scaffold); they are already fully specified in 06_DATA_CONTRACTS.

## Files

```
supabase/
├── migrations/
│   ├── 20260619120000_schema.sql               tables, enums, indexes, triggers, profile auto-create
│   ├── 20260619120100_rls.sql                  RLS enable + policies for every table
│   ├── 20260619120200_storage.sql              buckets + path-prefix ownership (write) policies
│   └── 20260619130000_storage_public_read.sql  make user-content buckets public-read (Phase 3)
├── seed.sql                         5 destinations (fixed UUIDs) + 3 public seed journals
├── tests/
│   └── rls_verification.sql         self-contained cross-user isolation test (Phase 1 gate)
└── README.md
```

## Setup (local)

Prerequisites: [Supabase CLI](https://supabase.com/docs/guides/cli), Docker.

```bash
supabase init          # once, if supabase/config.toml does not exist yet
supabase start         # boots local Postgres + Auth + Storage
supabase db reset      # applies all migrations, then runs seed.sql
```

Run the RLS gate test against the local DB:

```bash
# DB_URL is printed by `supabase status` (the "DB URL").
psql "$DB_URL" -f supabase/tests/rls_verification.sql
# Expect: "RLS VERIFICATION PASSED" and a final ROLLBACK (no rows persisted).
```

## Setup (hosted project)

1. Create **separate dev and prod** Supabase projects (environment isolation, §7).
2. Link and push schema: `supabase link --project-ref <ref>` then `supabase db push`.
3. Run `supabase/seed.sql` in the SQL editor (runs as `postgres`, bypasses RLS).
4. Paste `supabase/tests/rls_verification.sql` into the SQL editor to confirm the gate.
5. Fill Vercel/host env vars from `.env.example`.

## Auth configuration (set in Supabase dashboard → Authentication)

Aligns with [02_USER_AND_AUTH_FLOWS](../ProjectDocs/Phase0/02_USER_AND_AUTH_FLOWS.md):

- **Email + password** provider enabled. (Google OAuth optional.)
- **Confirm email = ON.** A pre-confirmed seed user is created for the live demo.
- **Site URL** = production URL; **Redirect URLs** include `http://localhost:3000/auth/callback`
  and `<prod>/auth/callback`.
- Sessions are cookie-based via `@supabase/ssr` (configured in the app, Phase 2).
- Password policy (min length / complexity) is enforced by the Zod contracts (06) on top
  of Supabase defaults.

## Storage

Two buckets created by the storage migration: `avatars`, `journal-media`. Object paths
are `{user_id}/…`, so the path-prefix policies guarantee a user can only **write** under
their own prefix. **Writes stay owner-only; reads are public** as of Phase 3
(`20260619130000_storage_public_read.sql`): the public journal feed renders user images
for guests without per-request signed URLs, relying on unguessable UUID object names.

> **Deviation from [05_SECURITY_AND_RLS §4](../ProjectDocs/Phase0/05_SECURITY_AND_RLS.md).**
> Phase 0 specified private buckets + server-minted signed URLs. Phase 3 chose public-read
> to render the guest journal feed cheaply. Tradeoff: a draft/private journal's *images*
> become URL-reachable if the UUID path leaks (the journal **row** itself stays
> RLS-protected). Flagged for reconsideration in Phase 5 hardening if signed URLs are
> required.

Upload type/size limits (image-only, ≤5 MB) are enforced client-side in the uploader and
by the upload contracts (06). Editorial destination media is **not** here — it is
delivered by Cloudinary (D3).

## Schema notes / decisions

- Money is **integer cents, USD** (single-currency scope).
- `destinations` are static & seeded with **fixed UUIDs** so user content (wishlist,
  itinerary, journal) can FK to them; the same `slug`s back the static render dataset.
- **Soft delete** applies to `journals` only (`deleted_at`); the public feed predicate is
  `visibility = 'public' AND deleted_at IS NULL`. A delete in the UI = setting `deleted_at`
  → the entry disappears from feed and profile and stays gone after refresh (CRUDR Delete).
- `journals_seed_shape` enforces: seed rows have no owner + are public; user rows have an owner.
- `total_budget` on itineraries is maintained app-side inside the mutating Server Action
  (single validated place), not by a DB trigger.
- `handle_new_user` (SECURITY DEFINER) auto-creates a `profiles` row on signup, removing
  any client-side profile-creation race.

---

## Phase 1 Gate — verification checklist

The gate: *all data models, RLS, storage, and contracts support the complete judge demo
flow and the persistence requirement.*

- [ ] `supabase db reset` applies all three migrations with no errors.
- [ ] `seed.sql` loads: **5 destinations** + **3 public seed journals** are queryable.
- [ ] `tests/rls_verification.sql` prints **RLS VERIFICATION PASSED**.
- [ ] `on_auth_user_created` creates a `profiles` row for every new auth user.
- [ ] Storage buckets `avatars` + `journal-media` exist (public-read, owner-only write).
- [ ] Round-trip persistence proven per table (insert → commit → re-select returns the row).

### Demo-flow → backend support map

| Judge step (13) | Tables / policies that back it |
|-----------------|--------------------------------|
| 1 Landing · 2 Explore · 3 Destination | `destinations` (public read) + seed |
| 4 Authentication | `auth.users` + `handle_new_user` → `profiles` (cookie auth in Phase 2) |
| 5 Wishlist (+refresh) | `wishlists` (owner RLS, unique(user,dest) idempotent) |
| 6 Itinerary (+refresh) | `itineraries` → `itinerary_days` → `itinerary_items` (owner RLS via parent/grandparent) |
| 7 Journal CRUD incl. delete + image | `journals` (owner RLS, soft delete) + `journal_images` + `journal-media` bucket |
| 8 Profile (hub) | `profiles` + owner-scoped reads of wishlist/itineraries/journals |

Every authenticated table persists to Postgres and is read back server-side, satisfying
the **Refresh** half of the CRUDR gate at the data layer. The UI half is verified at the
Phase 3 gate.
