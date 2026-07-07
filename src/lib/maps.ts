/**
 * Build a Google Maps search URL for a place.
 *
 * - When `lat`/`lng` are provided, the name is anchored to those coordinates so
 *   the pin lands exactly right (matches the route-map behaviour).
 * - Otherwise an optional `context` (e.g. the destination's city/country)
 *   anchors the search so generic names ("Old Town") still resolve correctly.
 */
export function googleMapsSearchUrl(
  place: string,
  opts?: { context?: string; lat?: number | null; lng?: number | null },
): string {
  const hasCoords =
    typeof opts?.lat === "number" && typeof opts?.lng === "number";
  const query = hasCoords
    ? `${place} (${opts!.lat},${opts!.lng})`
    : opts?.context
      ? `${place}, ${opts.context}`
      : place;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
