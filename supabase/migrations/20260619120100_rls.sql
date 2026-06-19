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
