import type { Destination, DestinationSummary } from "@/types";
import { destinationImageId, galleryIds } from "@/constants/assets";

// Static, seeded destinations (D1). Values mirror supabase/seed.sql so the rendered
// pages and the DB rows never drift (same slug + same numbers). Budget = cents/day USD.

const media = (slug: string) => ({
  hero: destinationImageId(slug, "hero"),
  thumbnail: destinationImageId(slug, "thumbnail"),
  videoPoster: destinationImageId(slug, "videoPoster"),
  gallery: galleryIds(slug),
});

export const DESTINATIONS: Destination[] = [
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    summary:
      "Lush rice terraces, surf breaks, and temple-dotted hills — an island built for slow, soulful travel.",
    description:
      "Bali pairs spiritual calm with everyday adventure. Mornings begin in the misted rice terraces of Ubud, afternoons drift toward Canggu's surf, and evenings end with temple bells over the cliffs of Uluwatu. It rewards travelers who slow down.",
    coordinates: { lat: -8.4095, lng: 115.1889 },
    dna: { adventure: 70, culture: 75, food: 80, nature: 85, nightlife: 60, budgetFriendly: 85 },
    budget: { accommodation: 4000, food: 1500, transport: 1000 },
    travelTips: [
      "Rent a scooter for the hills, but hire a driver for long cross-island days.",
      "Carry a sarong — many temples require covered legs to enter.",
      "Visit popular temples at sunrise to beat both heat and crowds.",
    ],
    hiddenGems: [
      {
        title: "Sidemen Valley",
        description: "Ubud's quieter cousin — emerald terraces without the tour buses.",
        image: "go/destinations/bali/gem-sidemen",
      },
      {
        title: "Nusa Penida Cliffs",
        description: "A short boat ride to some of the island's most dramatic coastline.",
        image: "go/destinations/bali/gem-penida",
      },
    ],
    nearby: [
      { name: "Tegallalang Rice Terraces", distanceKm: 9, image: "go/destinations/bali/near-tegallalang" },
      { name: "Uluwatu Temple", distanceKm: 32, image: "go/destinations/bali/near-uluwatu" },
      { name: "Mount Batur", distanceKm: 47, image: "go/destinations/bali/near-batur" },
    ],
    media: media("bali"),
    categories: ["Beach", "Nature", "Wellness", "Budget"],
    bestSeason: "April – October (dry season)",
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    summary:
      "Neon-lit precision meets centuries-old ritual — the world's most electric culinary capital.",
    description:
      "Tokyo runs on contrast: a hush at a shrine one block, a wall of light in Shinjuku the next. It is a city to eat your way through, from basement department-store delicacies to seven-seat counters down unmarked stairs.",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    dna: { adventure: 55, culture: 95, food: 98, nature: 50, nightlife: 85, budgetFriendly: 40 },
    budget: { accommodation: 9000, food: 3500, transport: 1200 },
    travelTips: [
      "Get a rechargeable Suica/Pasmo card — it works on nearly every train and many shops.",
      "Cash still matters; carry some for small restaurants and shrines.",
      "Last trains run around midnight — plan your night out around them.",
    ],
    hiddenGems: [
      {
        title: "Yanaka Old Town",
        description: "A low-rise neighborhood of temples, cats, and pre-war streets.",
        image: "go/destinations/tokyo/gem-yanaka",
      },
      {
        title: "Omoide Yokocho",
        description: "Lantern-lit alleys of tiny yakitori counters near Shinjuku.",
        image: "go/destinations/tokyo/gem-omoide",
      },
    ],
    nearby: [
      { name: "Senso-ji Temple", distanceKm: 6, image: "go/destinations/tokyo/near-sensoji" },
      { name: "Meiji Jingu", distanceKm: 8, image: "go/destinations/tokyo/near-meiji" },
      { name: "teamLab Planets", distanceKm: 10, image: "go/destinations/tokyo/near-teamlab" },
    ],
    media: media("tokyo"),
    categories: ["City", "Food", "Culture", "Nightlife"],
    bestSeason: "March – May & October – November",
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    summary:
      "Boulevards, ateliers, and patisseries — an open-air museum of art, fashion, and food.",
    description:
      "Paris is best walked. Market mornings in the Marais, long café afternoons, and the slow gold of evening on the Seine. The headline sights are worth it, but the city's real pleasure is its unhurried everyday rhythm.",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    dna: { adventure: 45, culture: 98, food: 95, nature: 40, nightlife: 75, budgetFriendly: 35 },
    budget: { accommodation: 11000, food: 4000, transport: 1500 },
    travelTips: [
      "Many museums are free on the first Sunday of the month — go early.",
      "A carnet of metro tickets (or a Navigo pass) beats buying singles.",
      "Lunch menus (formule) are the best value at otherwise pricey restaurants.",
    ],
    hiddenGems: [
      {
        title: "Canal Saint-Martin",
        description: "Iron footbridges, indie cafés, and a local Sunday picnic scene.",
        image: "go/destinations/paris/gem-canal",
      },
      {
        title: "Promenade Plantée",
        description: "An elevated garden walk built on an old railway viaduct.",
        image: "go/destinations/paris/gem-promenade",
      },
    ],
    nearby: [
      { name: "Louvre Museum", distanceKm: 2, image: "go/destinations/paris/near-louvre" },
      { name: "Musée d'Orsay", distanceKm: 3, image: "go/destinations/paris/near-orsay" },
      { name: "Palace of Versailles", distanceKm: 20, image: "go/destinations/paris/near-versailles" },
    ],
    media: media("paris"),
    categories: ["City", "Culture", "Food", "Romance"],
    bestSeason: "April – June & September – October",
  },
  {
    slug: "new-york",
    name: "New York",
    country: "United States",
    region: "North America",
    summary:
      "A city of relentless reinvention — skyline, stages, and a restaurant for every craving.",
    description:
      "New York compresses the world into a grid. Gallery mornings downtown, a slice eaten standing up, a Broadway curtain at night, and a skyline that never quite lets you sleep. Every neighborhood is its own country.",
    coordinates: { lat: 40.7128, lng: -74.006 },
    dna: { adventure: 60, culture: 90, food: 92, nature: 35, nightlife: 95, budgetFriendly: 25 },
    budget: { accommodation: 15000, food: 5000, transport: 1500 },
    travelTips: [
      "An unlimited MetroCard/OMNY pays off fast if you ride more than a few times a day.",
      "Lunch in Midtown, dinner in the outer boroughs — better food, lower prices.",
      "Many museums are 'pay what you wish' for NY State residents; check entry rules.",
    ],
    hiddenGems: [
      {
        title: "The Cloisters",
        description: "A medieval monastery transplanted to a quiet park uptown.",
        image: "go/destinations/new-york/gem-cloisters",
      },
      {
        title: "Roosevelt Island Tram",
        description: "A cheap aerial commute with the city's best free skyline view.",
        image: "go/destinations/new-york/gem-tram",
      },
    ],
    nearby: [
      { name: "Central Park", distanceKm: 4, image: "go/destinations/new-york/near-central-park" },
      { name: "The High Line", distanceKm: 3, image: "go/destinations/new-york/near-highline" },
      { name: "Brooklyn Bridge", distanceKm: 5, image: "go/destinations/new-york/near-brooklyn-bridge" },
    ],
    media: media("new-york"),
    categories: ["City", "Food", "Nightlife", "Culture"],
    bestSeason: "April – June & September – early December",
  },
  {
    slug: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    region: "Europe",
    summary:
      "Alpine cinema in every direction — glacial lakes, peak railways, and pristine mountain air.",
    description:
      "Switzerland is engineered for wonder: trains that climb into the clouds, lakes the color of glass, and trails that open onto impossible valleys. Slow, scenic, and spotless — it rewards travelers who look up.",
    coordinates: { lat: 46.8182, lng: 8.2275 },
    dna: { adventure: 95, culture: 70, food: 75, nature: 99, nightlife: 45, budgetFriendly: 20 },
    budget: { accommodation: 13000, food: 4500, transport: 2000 },
    travelTips: [
      "A Swiss Travel Pass can cover trains, boats, and many cable cars — do the math first.",
      "Mountain weather turns fast; pack layers even on clear summer days.",
      "Supermarket picnics keep food costs sane in an expensive country.",
    ],
    hiddenGems: [
      {
        title: "Lauterbrunnen Valley",
        description: "A cliff-walled valley of 72 waterfalls beneath the Jungfrau.",
        image: "go/destinations/switzerland/gem-lauterbrunnen",
      },
      {
        title: "Oeschinen Lake",
        description: "A turquoise alpine lake reached by gondola and a short walk.",
        image: "go/destinations/switzerland/gem-oeschinen",
      },
    ],
    nearby: [
      { name: "Jungfraujoch", distanceKm: 20, image: "go/destinations/switzerland/near-jungfrau" },
      { name: "Lake Lucerne", distanceKm: 35, image: "go/destinations/switzerland/near-lucerne" },
      { name: "Matterhorn (Zermatt)", distanceKm: 90, image: "go/destinations/switzerland/near-matterhorn" },
    ],
    media: media("switzerland"),
    categories: ["Mountains", "Nature", "Adventure", "Scenic"],
    bestSeason: "June – September (hiking) · December – March (snow)",
  },
];

export const DESTINATION_SLUGS = DESTINATIONS.map((d) => d.slug);

export function getDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export function toSummary(d: Destination): DestinationSummary {
  return {
    slug: d.slug,
    name: d.name,
    country: d.country,
    region: d.region,
    summary: d.summary,
    thumbnail: d.media.thumbnail,
    categories: d.categories,
  };
}

export function getRelated(slug: string, limit = 3): DestinationSummary[] {
  const current = getDestination(slug);
  if (!current) return [];
  // Prefer same region, then fill with others; stable order.
  const others = DESTINATIONS.filter((d) => d.slug !== slug);
  const sameRegion = others.filter((d) => d.region === current.region);
  const rest = others.filter((d) => d.region !== current.region);
  return [...sameRegion, ...rest].slice(0, limit).map(toSummary);
}

export const FEATURED_SLUGS = ["bali", "tokyo", "switzerland"];

export function getFeatured(): DestinationSummary[] {
  return FEATURED_SLUGS.map(getDestination)
    .filter((d): d is Destination => Boolean(d))
    .map(toSummary);
}
