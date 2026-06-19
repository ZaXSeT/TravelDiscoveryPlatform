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
   '33333333-3333-4333-8333-333333333333', 'public', now())
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
