import type { ActionResult } from "@/types";

type ErrorCode = Extract<
  ActionResult<unknown>,
  { ok: false }
>["error"]["code"];

export function ok<T = undefined>(data?: T): ActionResult<T> {
  return { ok: true, data: data as T };
}

export function fail(
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
): ActionResult<never> {
  return { ok: false, error: { code, message, fields } };
}
