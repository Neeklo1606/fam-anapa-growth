export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatRuPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);
  const d = digits.slice(1);
  let out = "+7";
  if (d.length === 0) return out + " ";
  out += " (" + d.slice(0, 3);
  if (d.length < 3) return out;
  out += ") " + d.slice(3, 6);
  if (d.length < 6) return out;
  out += "-" + d.slice(6, 8);
  if (d.length < 8) return out;
  out += "-" + d.slice(8, 10);
  return out;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
