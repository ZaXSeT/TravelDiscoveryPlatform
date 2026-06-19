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
