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
