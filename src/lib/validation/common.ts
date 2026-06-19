import { z } from "zod";
import { DESTINATION_SLUGS } from "@/constants/destinations";

// Shared field schemas (06_DATA_CONTRACTS.md). Single source of truth for FE + BE.

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Name is too short")
  .max(50, "Name is too long");

export const destinationSlugSchema = z.enum(
  DESTINATION_SLUGS as [string, ...string[]],
);

export const optionalDestinationSlug = destinationSlugSchema.nullish();

export const uuidSchema = z.string().uuid();

export const centsSchema = z.number().int().min(0);

/** Same-origin relative path only (open-redirect guard). */
export const returnToSchema = z
  .string()
  .regex(/^\/(?!\/)/, "Invalid redirect")
  .optional();

export function safeReturnTo(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;
  return /^\/(?!\/)/.test(value) ? value : fallback;
}
