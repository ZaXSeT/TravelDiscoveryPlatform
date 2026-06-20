import type { InspirationEntry } from "@/types";

// Static homepage inspiration teaser. Mirrors the seed journals in supabase/seed.sql so
// the home page feels "alive" before the Journal feature ships (Phase 3). Read-only.

export const INSPIRATION: InspirationEntry[] = [
  {
    slug: "seven-days-in-bali",
    title: "7 Days in Bali",
    excerpt:
      "Rice terraces at dawn, surf at noon, and temple bells at dusk. A week of slow island living.",
    author: "Orbis Editorial",
    cover: "go/journal/seven-days-in-bali/cover",
    destinationSlug: "bali",
  },
  {
    slug: "spring-in-tokyo",
    title: "Spring in Tokyo",
    excerpt:
      "Cherry blossoms, hidden alley kitchens, and the quiet order of a city in bloom.",
    author: "Orbis Editorial",
    cover: "go/journal/spring-in-tokyo/cover",
    destinationSlug: "tokyo",
  },
  {
    slug: "a-weekend-in-paris",
    title: "A Weekend in Paris",
    excerpt: "Two days of museums, market mornings, and long café afternoons.",
    author: "Orbis Editorial",
    cover: "go/journal/a-weekend-in-paris/cover",
    destinationSlug: "paris",
  },
];
