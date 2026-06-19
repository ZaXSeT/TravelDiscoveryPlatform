-- =============================================================================
-- Phase 1 — Backend & Data : RLS VERIFICATION (Phase 1 gate)
-- Implements the verification required by ProjectDocs/Phase0/05_SECURITY_AND_RLS.md §3.
--
-- Self-contained: creates two users + test rows, asserts isolation, then ROLLBACKs
-- (nothing is persisted). Run AFTER migrations are applied:
--
--   Local:   supabase db reset           # applies migrations + seed
--            psql "$DB_URL" -f supabase/tests/rls_verification.sql
--   Or in the Supabase SQL editor (runs as postgres / bypassrls for setup).
--
-- Any failed assertion raises an exception and aborts with a clear FAIL message.
-- A clean run ends with: "RLS VERIFICATION PASSED".
-- =============================================================================

begin;

-- Test identities (fixed UUIDs).
-- A = aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1
-- B = bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1

-- -----------------------------------------------------------------------------
-- SETUP (runs as the superuser/postgres connection → bypasses RLS)
-- -----------------------------------------------------------------------------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
   confirmation_token, recovery_token, email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
   'authenticated', 'authenticated', 'rls_test_a@example.com',
   '$2a$10$abcdefghijklmnopqrstuuW6e0Q1Yx0m3l8d5r3sJh0bO9p3kS3yK', now(),
   now(), now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"display_name":"RLS Test A"}'::jsonb, '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
   'authenticated', 'authenticated', 'rls_test_b@example.com',
   '$2a$10$abcdefghijklmnopqrstuuW6e0Q1Yx0m3l8d5r3sJh0bO9p3kS3yK', now(),
   now(), now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"display_name":"RLS Test B"}'::jsonb, '', '', '', '');

-- The on_auth_user_created trigger must have created two profiles.
do $$
declare n int;
begin
  select count(*) into n from public.profiles
   where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1');
  if n <> 2 then
    raise exception 'FAIL: handle_new_user did not create both profiles (found %)', n;
  end if;
end $$;

-- A test destination + one private journal (owner A) + one public journal.
insert into public.destinations
  (id, slug, name, country, region, summary, latitude, longitude,
   dna_adventure, dna_culture, dna_food, dna_nature, dna_nightlife, dna_budget_friendly,
   budget_accommodation, budget_food, budget_transport)
values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'rls-test-dest', 'Testland', 'Testonia', 'Testia',
   'A destination used only by the RLS test.', 0, 0, 50,50,50,50,50,50, 1000, 1000, 1000);

insert into public.journals
  (id, user_id, is_seed, author_label, slug, title, body, visibility, published_at)
values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', false,
   'RLS Test A', 'rls-private-a', 'Private journal A', 'secret body', 'private', null),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1', null, true,
   'GO Editorial', 'rls-public-seed', 'Public seed journal', 'public body', 'public', now());

-- -----------------------------------------------------------------------------
-- Helper macro pattern: "login as" = reset to superuser, set claims, set role.
-- (SET ROLE inside a function reverts on exit, so we switch at top level.)
-- -----------------------------------------------------------------------------

-- ===== Act as USER A =====
reset role;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1","role":"authenticated"}', true);
set local role authenticated;

-- A can create their own wishlist.
insert into public.wishlists (user_id, destination_id)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1');

-- A can build an itinerary chain (itinerary -> day -> item).
insert into public.itineraries (id, user_id, title)
values ('ffffffff-ffff-4fff-8fff-fffffffffff1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'A trip');
insert into public.itinerary_days (id, itinerary_id, day_index)
values ('1a000000-0000-4000-8000-0000000000a1', 'ffffffff-ffff-4fff-8fff-fffffffffff1', 1);
insert into public.itinerary_items (day_id, title, cost)
values ('1a000000-0000-4000-8000-0000000000a1', 'Visit somewhere', 2500);

do $$
declare n int;
begin
  select count(*) into n from public.wishlists;
  if n <> 1 then raise exception 'FAIL: A should see exactly 1 wishlist, saw %', n; end if;

  select count(*) into n from public.journals;          -- A sees own private + public seed
  if n <> 2 then raise exception 'FAIL: A should see 2 journals (own private + public), saw %', n; end if;

  select count(*) into n from public.itinerary_items;   -- chain visible to owner
  if n <> 1 then raise exception 'FAIL: A should see 1 itinerary item, saw %', n; end if;
end $$;

-- ===== Act as USER B =====
reset role;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1","role":"authenticated"}', true);
set local role authenticated;

do $$
declare n int;
begin
  -- B cannot see A's private rows.
  select count(*) into n from public.wishlists;
  if n <> 0 then raise exception 'FAIL: B can see %s of A''s wishlist rows', n; end if;

  select count(*) into n from public.itineraries;
  if n <> 0 then raise exception 'FAIL: B can see %s of A''s itineraries', n; end if;

  select count(*) into n from public.itinerary_days;
  if n <> 0 then raise exception 'FAIL: B can see A''s itinerary days (%)', n; end if;

  select count(*) into n from public.itinerary_items;
  if n <> 0 then raise exception 'FAIL: B can see A''s itinerary items (%)', n; end if;

  -- B sees only the public journal, not A's private one.
  select count(*) into n from public.journals;
  if n <> 1 then raise exception 'FAIL: B should see only 1 (public) journal, saw %', n; end if;
end $$;

-- B cannot insert a wishlist owned by A (WITH CHECK must reject → SQLSTATE 42501).
do $$
begin
  begin
    insert into public.wishlists (user_id, destination_id)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1');
    raise exception 'FAIL: B was able to insert a wishlist owned by A';
  exception when insufficient_privilege then
    null;  -- expected: row-level security violation
  end;
end $$;

-- B cannot add a day to A's itinerary (parent ownership check → 42501).
do $$
begin
  begin
    insert into public.itinerary_days (itinerary_id, day_index)
    values ('ffffffff-ffff-4fff-8fff-fffffffffff1', 2);
    raise exception 'FAIL: B was able to add a day to A''s itinerary';
  exception when insufficient_privilege then
    null;  -- expected
  end;
end $$;

-- B updating A's profile affects 0 rows (A's row is invisible to B's UPDATE).
do $$
declare n int;
begin
  with upd as (
    update public.profiles set bio = 'hacked'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
    returning 1
  )
  select count(*) into n from upd;
  if n <> 0 then raise exception 'FAIL: B updated A''s profile (% rows)', n; end if;
end $$;

-- ===== Act as ANON =====
reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

do $$
declare n int;
begin
  -- anon can read destinations (public catalog).
  select count(*) into n from public.destinations;
  if n < 1 then raise exception 'FAIL: anon cannot read destinations'; end if;

  -- anon sees only the public journal.
  select count(*) into n from public.journals;
  if n <> 1 then raise exception 'FAIL: anon should see only 1 public journal, saw %', n; end if;

  -- anon cannot read any wishlist / itinerary rows.
  select count(*) into n from public.wishlists;
  if n <> 0 then raise exception 'FAIL: anon can read wishlist rows (%)', n; end if;

  select count(*) into n from public.itineraries;
  if n <> 0 then raise exception 'FAIL: anon can read itineraries (%)', n; end if;
end $$;

-- anon cannot insert a destination (no write policy → 42501).
do $$
begin
  begin
    insert into public.destinations
      (slug, name, country, region, summary, latitude, longitude,
       dna_adventure, dna_culture, dna_food, dna_nature, dna_nightlife, dna_budget_friendly,
       budget_accommodation, budget_food, budget_transport)
    values ('anon-hack','x','x','x','x',0,0,0,0,0,0,0,0,0,0,0);
    raise exception 'FAIL: anon inserted a destination';
  exception when insufficient_privilege then
    null;  -- expected
  end;
end $$;

reset role;
do $$ begin raise notice 'RLS VERIFICATION PASSED'; end $$;

rollback;
