import "server-only";
import { createHash } from "node:crypto";

// Checks a password against HaveIBeenPwned's k-anonymity range API. Only the first 5 chars
// of the SHA-1 hash ever leave the server, so the password itself is never transmitted.
// Fail-open (returns false) on any error/timeout so a HIBP outage never blocks sign-up.
export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const sha1 = createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    let res: Response;
    try {
      res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { "Add-Padding": "true" },
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return false;

    const body = await res.text();
    return body
      .split("\n")
      .some((line) => line.split(":")[0]?.trim() === suffix);
  } catch {
    return false; // fail-open — never block auth because HIBP is unreachable
  }
}
