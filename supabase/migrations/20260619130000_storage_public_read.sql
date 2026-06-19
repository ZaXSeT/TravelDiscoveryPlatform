-- =============================================================================
-- Phase 3 — make user-content buckets public-read.
-- WRITES remain owner-only via the Storage RLS policies from 20260619120200.
-- Public read lets the public journal feed render images for guests without
-- per-request signed URLs. Object paths are unguessable UUIDs.
-- =============================================================================

update storage.buckets
set public = true
where id in ('avatars', 'journal-media');
