-- =============================================================================
-- Orbis — one-shot DB setup (all migrations + seed, in order).
-- Paste into Supabase Studio → SQL editor and Run ONCE on a fresh project.
-- (Generated from supabase/migrations/* + supabase/seed.sql — do not hand-edit.)
-- =============================================================================

-- =============================================================================
-- Phase 1 — Backend & Data : SCHEMA
-- Travel Discovery Platform
--
-- Implements ProjectDocs/Phase0/04_DATABASE_SCHEMA.md.
-- Conventions:
--   * UUID primary keys
--   * created_at / updated_at on every table (updated_at via trigger)
--   * money stored as integer cents, currency USD (single-currency scope)
--   * soft delete only for journals
--   * destinations are static/seeded (no runtime CRUD)
-- RLS policies live in the next migration (…_rls.sql); storage in (…_storage.sql).
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.travel_style as enum ('adventure', 'culture', 'food', 'nature', 'luxury');
create type public.journal_visibility as enum ('private', 'public');
create type public.itinerary_source as enum ('manual', 'generated');

-- -----------------------------------------------------------------------------
-- Shared trigger function: keep updated_at fresh
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =============================================================================
-- profiles  (1:1 with auth.users; created by trigger on signup)
-- =============================================================================
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 50),
  avatar_path   text,
  bio           text check (bio is null or char_length(bio) <= 280),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'User profile, 1:1 with auth.users. Row created automatically by handle_new_user().';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        split_part(new.email, '@', 1),
        'Traveler'
      ),
      50
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- destinations  (static, seeded, read-only at runtime)
-- =============================================================================
create table public.destinations (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  country              text not null,
  region               text not null,
  summary              text not null,
  latitude             double precision not null,
  longitude            double precision not null,
  dna_adventure        smallint not null check (dna_adventure between 0 and 100),
  dna_culture          smallint not null check (dna_culture between 0 and 100),
  dna_food             smallint not null check (dna_food between 0 and 100),
  dna_nature           smallint not null check (dna_nature between 0 and 100),
  dna_nightlife        smallint not null check (dna_nightlife between 0 and 100),
  dna_budget_friendly  smallint not null check (dna_budget_friendly between 0 and 100),
  budget_accommodation integer not null check (budget_accommodation >= 0),
  budget_food          integer not null check (budget_food >= 0),
  budget_transport     integer not null check (budget_transport >= 0),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.destinations is 'Static, seeded destinations. Budget fields are integer cents/day (USD). Read-only at runtime.';

create trigger destinations_set_updated_at
  before update on public.destinations
  for each row execute function public.set_updated_at();

-- =============================================================================
-- wishlists  (user x destination)
-- =============================================================================
create table public.wishlists (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, destination_id)            -- idempotent saves
);

create index wishlists_user_id_idx on public.wishlists (user_id);

create trigger wishlists_set_updated_at
  before update on public.wishlists
  for each row execute function public.set_updated_at();

-- =============================================================================
-- itineraries
-- =============================================================================
create table public.itineraries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 120),
  destination_id uuid references public.destinations (id) on delete set null,
  source         public.itinerary_source not null default 'manual',
  style          public.travel_style,
  total_budget   integer not null default 0 check (total_budget >= 0),  -- cents; app-maintained sum
  start_date     date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index itineraries_user_id_created_idx on public.itineraries (user_id, created_at desc);

create trigger itineraries_set_updated_at
  before update on public.itineraries
  for each row execute function public.set_updated_at();

-- =============================================================================
-- itinerary_days
-- =============================================================================
create table public.itinerary_days (
  id            uuid primary key default gen_random_uuid(),
  itinerary_id  uuid not null references public.itineraries (id) on delete cascade,
  day_index     smallint not null check (day_index >= 1),
  title         text check (title is null or char_length(title) <= 120),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (itinerary_id, day_index)
);

create index itinerary_days_itinerary_id_idx on public.itinerary_days (itinerary_id);

create trigger itinerary_days_set_updated_at
  before update on public.itinerary_days
  for each row execute function public.set_updated_at();

-- =============================================================================
-- itinerary_items
-- =============================================================================
create table public.itinerary_items (
  id             uuid primary key default gen_random_uuid(),
  day_id         uuid not null references public.itinerary_days (id) on delete cascade,
  position       smallint not null default 0 check (position >= 0),
  title          text not null check (char_length(title) between 1 and 160),
  start_time     time,
  cost           integer not null default 0 check (cost >= 0),   -- cents
  note           text check (note is null or char_length(note) <= 500),
  destination_id uuid references public.destinations (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index itinerary_items_day_id_idx on public.itinerary_items (day_id);

create trigger itinerary_items_set_updated_at
  before update on public.itinerary_items
  for each row execute function public.set_updated_at();

-- =============================================================================
-- journals  (soft-deletable; seed entries have user_id = null, is_seed = true)
-- =============================================================================
create table public.journals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete cascade,  -- null for seed entries
  is_seed        boolean not null default false,
  author_label   text not null,
  slug           text not null unique,
  title          text not null check (char_length(title) between 1 and 140),
  excerpt        text check (excerpt is null or char_length(excerpt) <= 280),
  body           text not null,                                      -- sanitized markdown
  cover_path     text,
  destination_id uuid references public.destinations (id) on delete set null,
  visibility     public.journal_visibility not null default 'private',
  published_at   timestamptz,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- A seed entry must be public and have no owner; a user entry must have an owner.
  constraint journals_seed_shape check (
    (is_seed = true  and user_id is null) or
    (is_seed = false and user_id is not null)
  )
);

comment on table public.journals is 'User and seed travel journals. Soft delete via deleted_at. Public feed = visibility=public AND deleted_at IS NULL.';

create index journals_user_id_idx on public.journals (user_id);
-- Hot path: the public feed query.
create index journals_public_feed_idx
  on public.journals (published_at desc)
  where visibility = 'public' and deleted_at is null;

create trigger journals_set_updated_at
  before update on public.journals
  for each row execute function public.set_updated_at();

-- =============================================================================
-- journal_images
-- =============================================================================
create table public.journal_images (
  id           uuid primary key default gen_random_uuid(),
  journal_id   uuid not null references public.journals (id) on delete cascade,
  storage_path text not null,                 -- Supabase Storage path (user) or Cloudinary id (seed)
  position     smallint not null default 0 check (position >= 0),
  alt          text check (alt is null or char_length(alt) <= 160),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index journal_images_journal_id_idx on public.journal_images (journal_id);

create trigger journal_images_set_updated_at
  before update on public.journal_images
  for each row execute function public.set_updated_at();


-- =============================================================================
-- Phase 1 — Backend & Data : ROW LEVEL SECURITY
-- Implements ProjectDocs/Phase0/05_SECURITY_AND_RLS.md §3.
--
-- Model: default deny. Owner = auth.uid(). Public read for destinations and
-- published journals. service_role bypasses RLS (used only by trusted server code
-- and the seed). Table-level grants come from Supabase defaults; RLS is the boundary.
-- =============================================================================

-- Enable RLS on every table.
alter table public.profiles         enable row level security;
alter table public.destinations     enable row level security;
alter table public.wishlists        enable row level security;
alter table public.itineraries      enable row level security;
alter table public.itinerary_days   enable row level security;
alter table public.itinerary_items  enable row level security;
alter table public.journals         enable row level security;
alter table public.journal_images   enable row level security;

-- -----------------------------------------------------------------------------
-- profiles : own row only. INSERT happens via SECURITY DEFINER trigger (no policy).
-- -----------------------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- destinations : public read; no writes (seed uses service_role / superuser).
-- -----------------------------------------------------------------------------
create policy "destinations_select_all"
  on public.destinations for select
  to anon, authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- wishlists : own rows.
-- -----------------------------------------------------------------------------
create policy "wishlists_select_own"
  on public.wishlists for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "wishlists_insert_own"
  on public.wishlists for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "wishlists_delete_own"
  on public.wishlists for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- itineraries : own rows.
-- -----------------------------------------------------------------------------
create policy "itineraries_select_own"
  on public.itineraries for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "itineraries_insert_own"
  on public.itineraries for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "itineraries_update_own"
  on public.itineraries for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "itineraries_delete_own"
  on public.itineraries for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- itinerary_days : ownership via parent itinerary.
-- -----------------------------------------------------------------------------
create policy "itinerary_days_all_own"
  on public.itinerary_days for all
  to authenticated
  using (
    exists (
      select 1 from public.itineraries i
      where i.id = itinerary_id and i.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.itineraries i
      where i.id = itinerary_id and i.user_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- itinerary_items : ownership via grandparent itinerary (through days).
-- -----------------------------------------------------------------------------
create policy "itinerary_items_all_own"
  on public.itinerary_items for all
  to authenticated
  using (
    exists (
      select 1
      from public.itinerary_days d
      join public.itineraries i on i.id = d.itinerary_id
      where d.id = day_id and i.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.itinerary_days d
      join public.itineraries i on i.id = d.itinerary_id
      where d.id = day_id and i.user_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- journals : public can read published; owner can read all of their own.
-- Two permissive SELECT policies are OR'd by Postgres.
-- -----------------------------------------------------------------------------
create policy "journals_select_public"
  on public.journals for select
  to anon, authenticated
  using (visibility = 'public' and deleted_at is null);

create policy "journals_select_own"
  on public.journals for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "journals_insert_own"
  on public.journals for insert
  to authenticated
  with check (user_id = (select auth.uid()) and is_seed = false);

create policy "journals_update_own"
  on public.journals for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and is_seed = false);

create policy "journals_delete_own"
  on public.journals for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- journal_images : readable when parent journal is visible; writable by owner.
-- -----------------------------------------------------------------------------
create policy "journal_images_select_visible"
  on public.journal_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.journals j
      where j.id = journal_id
        and (
          (j.visibility = 'public' and j.deleted_at is null)
          or j.user_id = (select auth.uid())
        )
    )
  );

create policy "journal_images_insert_own"
  on public.journal_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.journals j
      where j.id = journal_id and j.user_id = (select auth.uid())
    )
  );

create policy "journal_images_update_own"
  on public.journal_images for update
  to authenticated
  using (
    exists (
      select 1 from public.journals j
      where j.id = journal_id and j.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.journals j
      where j.id = journal_id and j.user_id = (select auth.uid())
    )
  );

create policy "journal_images_delete_own"
  on public.journal_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.journals j
      where j.id = journal_id and j.user_id = (select auth.uid())
    )
  );


-- =============================================================================
-- Phase 1 — Backend & Data : STORAGE
-- Implements ProjectDocs/Phase0/05_SECURITY_AND_RLS.md §4 and 07_MEDIA…md.
--
-- Buckets (private). Object path convention WITHIN a bucket:
--   avatars         : {user_id}/{uuid}.webp
--   journal-media   : {user_id}/{journal_id}/{uuid}.webp
-- => (storage.foldername(name))[1] is always the owner's user id.
--
-- Buckets are private: public display uses signed URLs minted server-side
-- (service_role) after a visibility/ownership check. No public read policy.
-- Editorial destination media is NOT here (it lives in Cloudinary, D3).
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false),
  ('journal-media', 'journal-media', false)
on conflict (id) do nothing;

-- storage.objects already has RLS enabled by Supabase; we only add policies.

-- -----------------------------------------------------------------------------
-- avatars : owner-only write/read under their own {user_id}/ prefix.
-- -----------------------------------------------------------------------------
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- -----------------------------------------------------------------------------
-- journal-media : owner-only write/read under their own {user_id}/ prefix.
-- -----------------------------------------------------------------------------
create policy "journal_media_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "journal_media_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "journal_media_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "journal_media_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- =============================================================================
-- Phase 3 — make user-content buckets public-read.
-- WRITES remain owner-only via the Storage RLS policies from 20260619120200.
-- Public read lets the public journal feed render images for guests without
-- per-request signed URLs. Object paths are unguessable UUIDs.
-- =============================================================================

update storage.buckets
set public = true
where id in ('avatars', 'journal-media');


-- =============================================================================
-- Phase 1 — Backend & Data : SEED
-- Run automatically by `supabase db reset`, or paste into the SQL editor (prod).
-- Idempotent: re-running upserts the same fixed-UUID rows.
--
-- Seeds:
--   * 5 static destinations (fixed UUIDs so user content can FK to them)
--   * 3 editorial/seed journals (public) so the journal feed is alive pre-users
-- Money fields are integer cents/day (USD).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Destinations
-- -----------------------------------------------------------------------------
insert into public.destinations
  (id, slug, name, country, region, summary, latitude, longitude,
   dna_adventure, dna_culture, dna_food, dna_nature, dna_nightlife, dna_budget_friendly,
   budget_accommodation, budget_food, budget_transport)
values
  ('11111111-1111-4111-8111-111111111111', 'bali', 'Bali', 'Indonesia', 'Asia',
   'Lush rice terraces, surf breaks, and temple-dotted hills — an island built for slow, soulful travel.',
   -8.4095, 115.1889,
   70, 75, 80, 85, 60, 85,
   4000, 1500, 1000),

  ('22222222-2222-4222-8222-222222222222', 'tokyo', 'Tokyo', 'Japan', 'Asia',
   'Neon-lit precision meets centuries-old ritual — the world''s most electric culinary capital.',
   35.6762, 139.6503,
   55, 95, 98, 50, 85, 40,
   9000, 3500, 1200),

  ('33333333-3333-4333-8333-333333333333', 'paris', 'Paris', 'France', 'Europe',
   'Boulevards, ateliers, and patisseries — an open-air museum of art, fashion, and food.',
   48.8566, 2.3522,
   45, 98, 95, 40, 75, 35,
   11000, 4000, 1500),

  ('44444444-4444-4444-8444-444444444444', 'new-york', 'New York', 'United States', 'North America',
   'A city of relentless reinvention — skyline, stages, and a restaurant for every craving.',
   40.7128, -74.0060,
   60, 90, 92, 35, 95, 25,
   15000, 5000, 1500),

  ('55555555-5555-4555-8555-555555555555', 'switzerland', 'Switzerland', 'Switzerland', 'Europe',
   'Alpine cinema in every direction — glacial lakes, peak railways, and pristine mountain air.',
   46.8182, 8.2275,
   95, 70, 75, 99, 45, 20,
   13000, 4500, 2000)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  dna_adventure = excluded.dna_adventure,
  dna_culture = excluded.dna_culture,
  dna_food = excluded.dna_food,
  dna_nature = excluded.dna_nature,
  dna_nightlife = excluded.dna_nightlife,
  dna_budget_friendly = excluded.dna_budget_friendly,
  budget_accommodation = excluded.budget_accommodation,
  budget_food = excluded.budget_food,
  budget_transport = excluded.budget_transport;

-- -----------------------------------------------------------------------------
-- Seed journals (editorial). user_id NULL + is_seed = true + public + published.
-- cover_path / image storage_path hold Cloudinary public IDs for seed content.
-- -----------------------------------------------------------------------------
insert into public.journals
  (id, user_id, is_seed, author_label, slug, title, excerpt, body, cover_path,
   destination_id, visibility, published_at)
values
  ('10000000-0000-4000-8000-000000000001', null, true, 'GO Editorial',
   'seven-days-in-bali', '7 Days in Bali',
   'Rice terraces at dawn, surf at noon, and temple bells at dusk — a week of slow island living.',
   E'## Day 1 — Arrival in Ubud\nSettle into the highlands, wander the Campuhan Ridge, and ease into island time.\n\n## Day 3 — Surf & Sand\nTrade the hills for Canggu''s breaks and beach clubs.\n\n## Day 7 — Temples & Farewell\nClose the week with a sunrise at a clifftop temple.',
   'go/journal/seven-days-in-bali/cover',
   '11111111-1111-4111-8111-111111111111', 'public', now()),

  ('10000000-0000-4000-8000-000000000002', null, true, 'GO Editorial',
   'spring-in-tokyo', 'Spring in Tokyo',
   'Cherry blossoms, hidden alley kitchens, and the quiet order of a city in bloom.',
   E'## Hanami\nPicnic beneath the sakura in Ueno Park.\n\n## Backstreet Eats\nFollow the lanterns into Omoide Yokocho for yakitori and noise.\n\n## Calm\nFind stillness at Meiji Jingu before the crowds.',
   'go/journal/spring-in-tokyo/cover',
   '22222222-2222-4222-8222-222222222222', 'public', now()),

  ('10000000-0000-4000-8000-000000000003', null, true, 'GO Editorial',
   'a-weekend-in-paris', 'A Weekend in Paris',
   'Two days of museums, market mornings, and long café afternoons.',
   E'## Saturday\nMorning at the Marais markets, afternoon at the Louvre.\n\n## Sunday\nA slow stroll along the Seine and a last espresso before the train.',
   'go/journal/a-weekend-in-paris/cover',
   '33333333-3333-4333-8333-333333333333', 'public', now() - interval '1 day'),

  ('10000000-0000-4000-8000-000000000004', null, true, 'GO Editorial',
   'winter-in-new-york', 'Winter in New York',
   'Ice skating, holiday lights, and the relentless energy of a city that never stops moving.',
   E'## The Cold Rush\nThe air bites, but the city glows. A walk through Central Park under fresh snow.\n\n## Warm Refuges\nDucking into corner diners and world-class museums to escape the chill.',
   'go/destinations/new-york/hero',
   '44444444-4444-4444-8444-444444444444', 'public', now() - interval '2 days'),

  ('10000000-0000-4000-8000-000000000005', null, true, 'GO Editorial',
   'alpine-trains', 'Crossing the Swiss Alps',
   'A visual journey aboard the Glacier Express, winding through some of Europe''s most dramatic peaks.',
   E'## The Ascent\nLeaving the valley behind, the train slowly climbs into the clouds.\n\n## Glacial Views\nUninterrupted white landscapes stretch out as we cross the high passes.',
   'go/destinations/switzerland/hero',
   '55555555-5555-4555-8555-555555555555', 'public', now() - interval '3 days'),

  ('10000000-0000-4000-8000-000000000006', null, true, 'GO Editorial',
   'canggu-nomad-diaries', 'Canggu Nomad Diaries',
   'Finding balance between late-night coding sessions and early-morning surf breaks.',
   E'## Work and Waves\nThe rhythm of life here is simple: code, surf, eat, repeat.\n\n## Community\nMeeting creatives from every corner of the globe at sunset.',
   'go/destinations/bali/gallery-1',
   '11111111-1111-4111-8111-111111111111', 'public', now() - interval '4 days')
on conflict (id) do update set
  author_label = excluded.author_label,
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  cover_path = excluded.cover_path,
  destination_id = excluded.destination_id,
  visibility = excluded.visibility,
  published_at = excluded.published_at;

-- A couple of gallery images for one seed journal (Cloudinary public IDs).
insert into public.journal_images (id, journal_id, storage_path, position, alt)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
   'go/journal/seven-days-in-bali/gallery-1', 0, 'Rice terraces in Ubud at sunrise'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001',
   'go/journal/seven-days-in-bali/gallery-2', 1, 'Surfer at a Canggu beach break')
on conflict (id) do update set
  storage_path = excluded.storage_path,
  position = excluded.position,
  alt = excluded.alt;

-- =============================================================================
-- Travel DNA Assessment (migration 20260621120000) — persist the user's computed
-- Travel DNA profile (6 axes, 0–100) as JSON for reuse in itinerary generation.
-- Idempotent: safe to re-run.
-- =============================================================================
alter table public.profiles
  add column if not exists travel_dna jsonb;

-- =============================================================================
-- Seed ALL 46 destinations (Tier 1 + Tier 2) so every destination is saveable
-- to wishlists/itineraries. Idempotent: conflict on slug updates in place (existing
-- featured rows keep their id, so FKs from seed journals stay valid).
-- =============================================================================
insert into public.destinations
  (slug, name, country, region, summary, latitude, longitude,
   dna_adventure, dna_culture, dna_food, dna_nature, dna_nightlife, dna_budget_friendly,
   budget_accommodation, budget_food, budget_transport)
values
  ('bali', 'Bali', 'Indonesia', 'Asia', 'Lush rice terraces, surf breaks, and temple-dotted hills. An island built for slow, soulful travel.', -8.4095, 115.1889, 70, 75, 80, 85, 60, 85, 4000, 1500, 1000),
  ('tokyo', 'Tokyo', 'Japan', 'Asia', 'Neon-lit precision meets centuries-old ritual in the world''s most electric culinary capital.', 35.6762, 139.6503, 55, 95, 98, 50, 85, 40, 9000, 3500, 1200),
  ('paris', 'Paris', 'France', 'Europe', 'Boulevards, ateliers, and patisseries. An open-air museum of art, fashion, and food.', 48.8566, 2.3522, 45, 98, 95, 40, 75, 35, 11000, 4000, 1500),
  ('new-york', 'New York', 'United States', 'North America', 'A city of relentless reinvention with a skyline, stages, and a restaurant for every craving.', 40.7128, -74.006, 60, 90, 92, 35, 95, 25, 15000, 5000, 1500),
  ('switzerland', 'Switzerland', 'Switzerland', 'Europe', 'Alpine cinema in every direction with glacial lakes, peak railways, and pristine mountain air.', 46.8182, 8.2275, 95, 70, 75, 99, 45, 20, 13000, 4500, 2000),
  ('kyoto', 'Kyoto', 'Japan', 'Asia', 'Temple gardens, geisha districts, and centuries of refined tradition.', 35.0116, 135.7681, 61, 54, 79, 74, 86, 35, 4500, 2700, 1800),
  ('seoul', 'Seoul', 'South Korea', 'Asia', 'Hyper-modern energy, palace courtyards, and late-night street food.', 37.5665, 126.978, 68, 54, 60, 34, 74, 35, 4000, 2400, 1600),
  ('bangkok', 'Bangkok', 'Thailand', 'Asia', 'Golden temples, canal markets, and the world''s best street eats.', 13.7563, 100.5018, 65, 69, 54, 47, 49, 85, 2250, 1350, 900),
  ('singapore', 'Singapore', 'Singapore', 'Asia', 'A garden city of futuristic skylines and hawker-stall flavor.', 1.3521, 103.8198, 75, 83, 54, 52, 83, 35, 5500, 3300, 2200),
  ('hanoi', 'Hanoi', 'Vietnam', 'Asia', 'Old-quarter lanes, lakeside calm, and unforgettable pho.', 21.0278, 105.8342, 53, 62, 60, 42, 79, 85, 1750, 1050, 700),
  ('rome', 'Rome', 'Italy', 'Europe', 'An open-air museum of ruins, piazzas, and perfect pasta.', 41.9028, 12.4964, 71, 87, 70, 64, 68, 35, 4750, 2850, 1900),
  ('amsterdam', 'Amsterdam', 'Netherlands', 'Europe', 'Canal rings, world-class museums, and a bicycle''s pace of life.', 52.3676, 4.9041, 78, 55, 74, 65, 46, 35, 5500, 3300, 2200),
  ('barcelona', 'Barcelona', 'Spain', 'Europe', 'Gaudí fantasy, tapas crawls, and Mediterranean beaches.', 41.3851, 2.1734, 56, 77, 66, 42, 79, 35, 4500, 2700, 1800),
  ('prague', 'Prague', 'Czechia', 'Europe', 'Fairytale spires, cobbled lanes, and riverside beer gardens.', 50.0755, 14.4378, 49, 69, 73, 49, 53, 85, 3000, 1800, 1200),
  ('vienna', 'Vienna', 'Austria', 'Europe', 'Imperial palaces, coffee houses, and effortless old-world elegance.', 48.2082, 16.3738, 54, 77, 72, 51, 87, 35, 4500, 2700, 1800),
  ('san-francisco', 'San Francisco', 'United States', 'North America', 'Fog-wrapped hills, the Golden Gate, and a serious food scene.', 37.7749, -122.4194, 77, 51, 64, 73, 76, 35, 7500, 4500, 3000),
  ('vancouver', 'Vancouver', 'Canada', 'North America', 'Where rainforest, ocean, and mountains meet a glass skyline.', 49.2827, -123.1207, 63, 55, 81, 72, 57, 35, 6000, 3600, 2400),
  ('toronto', 'Toronto', 'Canada', 'North America', 'Canada''s most diverse city with vibrant neighborhoods, galleries, and food.', 43.6532, -79.3832, 57, 60, 78, 76, 74, 35, 5500, 3300, 2200),
  ('chicago', 'Chicago', 'United States', 'North America', 'Bold architecture, lakefront beaches, and deep-dish everything.', 41.8781, -87.6298, 74, 66, 52, 79, 66, 35, 5500, 3300, 2200),
  ('sydney', 'Sydney', 'Australia', 'Oceania', 'Iconic harbor, golden beaches, and an easy outdoor lifestyle.', -33.8688, 151.2093, 51, 82, 82, 40, 69, 35, 6000, 3600, 2400),
  ('melbourne', 'Melbourne', 'Australia', 'Oceania', 'Laneway cafés, street art, and Australia''s culture capital.', -37.8136, 144.9631, 51, 81, 61, 76, 54, 35, 5500, 3300, 2200),
  ('queenstown', 'Queenstown', 'New Zealand', 'Oceania', 'The adventure capital featuring alpine lakes, peaks, and adrenaline.', -45.0312, 168.6626, 64, 87, 69, 66, 81, 35, 6500, 3900, 2600),
  ('dubai', 'Dubai', 'United Arab Emirates', 'Middle East', 'Desert futurism with record-breaking towers, malls, and beaches.', 25.2048, 55.2708, 48, 77, 52, 70, 41, 35, 8000, 4800, 3200),
  ('istanbul', 'Istanbul', 'Türkiye', 'Middle East', 'Two continents, grand bazaars, and Byzantine-Ottoman splendor.', 41.0082, 28.9784, 44, 88, 57, 65, 86, 85, 3000, 1800, 1200),
  ('cape-town', 'Cape Town', 'South Africa', 'Africa', 'Table Mountain, wine country, and dramatic coastal drives.', -33.9249, 18.4241, 43, 63, 54, 53, 52, 35, 4500, 2700, 1800),
  ('marrakech', 'Marrakech', 'Morocco', 'Africa', 'Souk mazes, riad courtyards, and the edge of the Sahara.', 31.6295, -7.9811, 41, 66, 69, 39, 84, 85, 3000, 1800, 1200),
  ('london', 'London', 'United Kingdom', 'Europe', 'Royal pageantry, world-class museums, and a pub on every corner.', 51.5074, -0.1278, 45, 90, 80, 40, 85, 30, 7000, 3000, 2000),
  ('lisbon', 'Lisbon', 'Portugal', 'Europe', 'Tiled facades, hilltop miradouros, and soulful fado nights.', 38.7223, -9.1393, 55, 80, 85, 55, 78, 65, 4000, 2000, 1200),
  ('santorini', 'Santorini', 'Greece', 'Europe', 'Whitewashed cliffs, caldera sunsets, and volcanic beaches.', 36.3932, 25.4615, 45, 60, 75, 80, 65, 35, 6000, 2800, 1500),
  ('venice', 'Venice', 'Italy', 'Europe', 'Canal labyrinths, Byzantine domes, and timeless romance.', 45.4408, 12.3155, 35, 92, 80, 45, 55, 35, 6500, 2800, 1500),
  ('reykjavik', 'Reykjavik', 'Iceland', 'Europe', 'Northern lights, geothermal lagoons, and raw volcanic wilderness.', 64.1466, -21.9426, 85, 60, 65, 95, 60, 25, 7000, 3200, 2500),
  ('berlin', 'Berlin', 'Germany', 'Europe', 'Cold-war history, world-class techno, and fearless street art.', 52.52, 13.405, 50, 85, 75, 45, 95, 55, 4500, 2200, 1400),
  ('hong-kong', 'Hong Kong', 'China', 'Asia', 'Neon skylines, dim sum dynasties, and peaks above the harbor.', 22.3193, 114.1694, 55, 78, 92, 50, 85, 45, 5500, 2500, 1500),
  ('taipei', 'Taipei', 'Taiwan', 'Asia', 'Night-market feasts, hot springs, and mountain temples.', 25.033, 121.5654, 55, 75, 90, 60, 80, 65, 3800, 1800, 1200),
  ('chiang-mai', 'Chiang Mai', 'Thailand', 'Asia', 'Lantern festivals, jungle temples, and gentle northern charm.', 18.7883, 98.9853, 75, 82, 85, 80, 60, 88, 2500, 1200, 800),
  ('siem-reap', 'Siem Reap', 'Cambodia', 'Asia', 'Sunrise over Angkor, jungle ruins, and Khmer warmth.', 13.3671, 103.8448, 65, 95, 70, 65, 55, 85, 2500, 1300, 900),
  ('jaipur', 'Jaipur', 'India', 'Asia', 'Pink-hued palaces, hilltop forts, and bazaar color.', 26.9124, 75.7873, 55, 92, 80, 45, 50, 85, 2800, 1300, 900),
  ('maldives', 'Maldives', 'Maldives', 'Asia', 'Overwater villas, coral reefs, and impossibly clear lagoons.', 3.2028, 73.2207, 60, 35, 60, 95, 40, 20, 12000, 4000, 2500),
  ('rio-de-janeiro', 'Rio de Janeiro', 'Brazil', 'South America', 'Mountain-framed beaches, samba nights, and carnival spirit.', -22.9068, -43.1729, 75, 75, 75, 85, 90, 55, 4000, 2000, 1300),
  ('cusco', 'Cusco', 'Peru', 'South America', 'Inca stonework, Andean markets, and the gateway to Machu Picchu.', -13.532, -71.9675, 90, 90, 70, 88, 55, 70, 3000, 1500, 1000),
  ('buenos-aires', 'Buenos Aires', 'Argentina', 'South America', 'Tango halls, grand boulevards, and late-night steak.', -34.6037, -58.3816, 45, 85, 85, 40, 92, 60, 3500, 1800, 1100),
  ('mexico-city', 'Mexico City', 'Mexico', 'North America', 'Aztec roots, mural-lined plazas, and a fearless food scene.', 19.4326, -99.1332, 55, 88, 92, 45, 82, 70, 3500, 1800, 1200),
  ('banff', 'Banff', 'Canada', 'North America', 'Turquoise lakes, glacier peaks, and Rocky Mountain trails.', 51.1784, -115.5708, 92, 35, 50, 98, 35, 40, 6000, 2800, 1800),
  ('auckland', 'Auckland', 'New Zealand', 'Oceania', 'Harbor sails, volcanic cones, and island day-trips.', -36.8485, 174.7633, 70, 60, 70, 80, 65, 45, 5000, 2400, 1600),
  ('cairo', 'Cairo', 'Egypt', 'Africa', 'Pyramids on the skyline, bazaars, and the eternal Nile.', 30.0444, 31.2357, 60, 95, 70, 40, 55, 80, 3000, 1500, 1000),
  ('petra', 'Petra', 'Jordan', 'Middle East', 'A rose-red rock city carved into desert canyons.', 30.3285, 35.4444, 80, 92, 55, 75, 35, 65, 4000, 1800, 1500)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  dna_adventure = excluded.dna_adventure,
  dna_culture = excluded.dna_culture,
  dna_food = excluded.dna_food,
  dna_nature = excluded.dna_nature,
  dna_nightlife = excluded.dna_nightlife,
  dna_budget_friendly = excluded.dna_budget_friendly,
  budget_accommodation = excluded.budget_accommodation,
  budget_food = excluded.budget_food,
  budget_transport = excluded.budget_transport;
