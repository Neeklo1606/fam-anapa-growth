import { promises as fs } from "node:fs";
import path from "node:path";
import type { MediaKind } from "@prisma/client";

const SKIP_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

const SKIP_EXT = new Set([
  "json",
  "webmanifest",
  "txt",
  "xml",
  "html",
  "htm",
  "map",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  "js",
  "css",
  "ts",
]);

const IMG_EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  bmp: "image/bmp",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const VID_EXT_TO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
};

export type ScannedBundledFile = {
  /** Relative to site `public/` using forward slashes, e.g. `img/logo.webp` */
  relPosix: string;
  mime: string;
  kind: MediaKind;
  sizeBytes: number;
  mtimeMs: number;
};

const BUNDLED_PREFIX = "bundled:";

export function encodeBundledMediaId(relPosix: string): string {
  return `${BUNDLED_PREFIX}${Buffer.from(relPosix, "utf8").toString("base64url")}`;
}

/** Returns relative POSIX path or null if id is not a bundled token. */
export function tryDecodeBundledMediaId(id: string): string | null {
  if (!id.startsWith(BUNDLED_PREFIX)) return null;
  const payload = id.slice(BUNDLED_PREFIX.length);
  try {
    const raw = Buffer.from(payload, "base64url").toString("utf8");
    if (!raw || raw.includes("\0")) return null;
    const posixNorm = path.posix.normalize(raw.replace(/\\/g, "/"));
    if (!posixNorm || posixNorm === ".") return null;
    return posixNorm;
  } catch {
    return null;
  }
}

export function isSafeBundledRelativePath(rel: string, publicRootAbs: string): boolean {
  if (!rel || rel.includes("\0")) return false;
  const posixNorm = path.posix.normalize(rel.replace(/\\/g, "/"));
  if (!posixNorm || posixNorm === ".") return false;
  const rootResolved = path.resolve(publicRootAbs);
  const parts = posixNorm.split("/").filter((p) => p.length > 0);
  const candidate = path.resolve(rootResolved, ...parts.map((p) => p.replace(/\\/g, "/")));
  const relative = path.relative(rootResolved, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false;
  return true;
}

function extLower(name: string): string | null {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m?.[1] ? m[1].toLowerCase() : null;
}

function classifyFile(name: string): { mime: string; kind: MediaKind } | null {
  const ext = extLower(name);
  if (!ext || SKIP_EXT.has(ext)) return null;
  if (IMG_EXT_TO_MIME[ext]) {
    return { mime: IMG_EXT_TO_MIME[ext], kind: "IMAGE" };
  }
  if (VID_EXT_TO_MIME[ext]) {
    return { mime: VID_EXT_TO_MIME[ext], kind: "VIDEO" };
  }
  return null;
}

/** Mime + kind for a filename under `public/` (used by media list + GET by id). */
export function classifyBundledFileBasename(name: string): { mime: string; kind: MediaKind } | null {
  return classifyFile(name);
}

async function walkPublicDir(relDirPosix: string, absDir: string, out: ScannedBundledFile[]): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(absDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (SKIP_NAMES.has(ent.name)) continue;
    const abs = path.join(absDir, ent.name);
    const relPosix = relDirPosix ? `${relDirPosix}/${ent.name}` : ent.name.replace(/\\/g, "/");
    if (ent.isDirectory()) {
      await walkPublicDir(relPosix, abs, out);
      continue;
    }
    if (!ent.isFile()) continue;
    const classified = classifyFile(ent.name);
    if (!classified) continue;
    const st = await fs.stat(abs).catch(() => null);
    if (!st) continue;
    out.push({
      relPosix,
      mime: classified.mime,
      kind: classified.kind,
      sizeBytes: st.size,
      mtimeMs: st.mtimeMs,
    });
  }
}

export async function scanBundledPublicFiles(publicRootAbs: string): Promise<ScannedBundledFile[]> {
  const root = path.resolve(publicRootAbs);
  const acc: ScannedBundledFile[] = [];
  await walkPublicDir("", root, acc);
  acc.sort((a, b) => a.relPosix.localeCompare(b.relPosix, "en"));
  return acc;
}
