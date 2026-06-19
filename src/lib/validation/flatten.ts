// Maps Zod flattened fieldErrors to a single message per field for UI display.
export function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs && msgs[0]) out[key] = msgs[0];
  }
  return out;
}
