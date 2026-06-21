// Typed route map - no hardcoded path strings in components.

export const routes = {
  home: "/",
  explore: "/explore",
  destination: (slug: string) => `/destinations/${slug}`,
  tripGenerator: "/trip-generator",
  travelDna: "/travel-dna",
  journal: "/journal",
  journalEntry: (slug: string) => `/journal/${slug}`,
  journalNew: "/journal/new",
  journalEdit: (slug: string) => `/journal/${slug}/edit`,

  // Authenticated (built in Phase 3) - referenced by guards/nav only when relevant.
  wishlist: "/wishlist",
  itineraries: "/itineraries",
  itinerary: (id: string) => `/itineraries/${id}`,
  profile: "/profile",

  // Auth
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  reset: "/auth/reset",
  updatePassword: "/auth/update-password",
  authCallback: "/auth/callback",
} as const;

export type AppRoute = typeof routes;
