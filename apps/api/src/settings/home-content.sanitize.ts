import { BadRequestException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

const MAX_JSON_CHARS = 400_000;
const MAX_STRING_CHARS = 20_000;

export function toSanitizedHomeJson(input: unknown): Prisma.InputJsonValue {
  if (input === null || input === undefined) {
    throw new BadRequestException("homeContent не задан");
  }
  let raw: unknown = input;
  if (typeof input === "object" && input !== null && !Array.isArray(input) && "homeContent" in input) {
    raw = (input as { homeContent: unknown }).homeContent;
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new BadRequestException("homeContent должен быть объектом");
  }
  const str = JSON.stringify(raw);
  if (str.length > MAX_JSON_CHARS) {
    throw new BadRequestException("Слишком большой объект контента главной страницы");
  }
  return sanitizeValue(raw) as Prisma.InputJsonValue;
}

function sanitizeValue(v: unknown): unknown {
  if (v === null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    return v.length > MAX_STRING_CHARS ? v.slice(0, MAX_STRING_CHARS) : v;
  }
  if (Array.isArray(v)) return v.map(sanitizeValue);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(o)) {
      if (k.length > 128) continue;
      out[k] = sanitizeValue(o[k]);
    }
    return out;
  }
  return null;
}
