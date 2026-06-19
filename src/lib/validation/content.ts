import { z } from "zod";
import {
  centsSchema,
  destinationSlugSchema,
  displayNameSchema,
  optionalDestinationSlug,
  uuidSchema,
} from "@/lib/validation/common";
import { limits } from "@/constants/config";

// Content contracts (06_DATA_CONTRACTS.md). Wishlist/itinerary/journal/trip are used by
// Phase 3+ Server Actions; defined here now so the contract layer is complete.

const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm");

// --- Profile ---
export const updateProfileSchema = z.object({
  displayName: displayNameSchema,
  bio: z.string().trim().max(280).nullish(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// --- Wishlist ---
export const wishlistAddSchema = z.object({ destinationSlug: destinationSlugSchema });
export const wishlistRemoveSchema = z.object({ destinationSlug: destinationSlugSchema });

// --- Itinerary ---
export const itineraryCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  destinationSlug: optionalDestinationSlug,
  startDate: z.string().date().nullish(),
});
export const itineraryUpdateSchema = itineraryCreateSchema.extend({
  id: uuidSchema,
});

export const dayCreateSchema = z.object({
  itineraryId: uuidSchema,
  title: z.string().trim().max(120).nullish(),
  dayIndex: z.number().int().min(1).optional(),
});

export const itemCreateSchema = z.object({
  dayId: uuidSchema,
  title: z.string().trim().min(1).max(160),
  startTime: timeOfDay.nullish(),
  cost: centsSchema.max(10_000_000),
  note: z.string().trim().max(500).nullish(),
  destinationSlug: optionalDestinationSlug,
});
export const itemUpdateSchema = itemCreateSchema
  .omit({ dayId: true })
  .extend({ id: uuidSchema });

// --- Journal ---
export const journalCreateSchema = z.object({
  title: z.string().trim().min(1).max(140),
  excerpt: z.string().trim().max(280).nullish(),
  bodyMarkdown: z.string().trim().min(1).max(20_000),
  destinationSlug: optionalDestinationSlug,
  visibility: z.enum(["private", "public"]).default("private"),
});
export const journalUpdateSchema = journalCreateSchema.extend({ id: uuidSchema });
export const journalDeleteSchema = z.object({ id: uuidSchema });
export const journalImageAddSchema = z.object({
  journalId: uuidSchema,
  alt: z.string().trim().max(160).nullish(),
  position: z.number().int().min(0).default(0),
});

// --- Trip generator (optional feature, D4) ---
export const travelStyleSchema = z.enum([
  "adventure",
  "culture",
  "food",
  "nature",
  "luxury",
]);
export const tripGenerateSchema = z.object({
  budget: centsSchema.min(20_000).max(5_000_000), // $200 – $50,000
  days: z.number().int().min(limits.tripDaysMin).max(limits.tripDaysMax),
  style: travelStyleSchema,
  destinationSlug: optionalDestinationSlug,
});

// --- Upload constraints (shared) ---
export const uploadConstraints = {
  maxBytes: limits.uploadMaxBytes,
  mimeTypes: limits.uploadMimeTypes,
};
