#!/usr/bin/env node
/**
 * After `next build` with `output: "standalone"`, Next.js does NOT copy
 * `public/` and `.next/static/` into `.next/standalone/`.
 * We copy them manually so the standalone server can serve them at
 * /img/*, /hero.mp4, /_next/static/*, etc.
 *
 * Layout (pnpm workspace, app at apps/web):
 *   apps/web/.next/standalone/apps/web/server.js
 *   apps/web/.next/standalone/apps/web/public/         (we write here)
 *   apps/web/.next/standalone/apps/web/.next/static/   (we write here)
 */

import { cp, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const appRoot = path.resolve(path.dirname(__filename), "..");
const standaloneApp = path.join(appRoot, ".next", "standalone", "apps", "web");

if (!existsSync(standaloneApp)) {
  console.error(
    `[copy-standalone-assets] expected directory not found: ${standaloneApp}\n` +
      `Did 'next build' run with output: "standalone"?`,
  );
  process.exit(1);
}

const jobs = [
  {
    name: "public",
    src: path.join(appRoot, "public"),
    dst: path.join(standaloneApp, "public"),
    optional: true,
  },
  {
    name: ".next/static",
    src: path.join(appRoot, ".next", "static"),
    dst: path.join(standaloneApp, ".next", "static"),
    optional: false,
  },
];

for (const j of jobs) {
  if (!existsSync(j.src)) {
    if (j.optional) {
      console.log(`[copy-standalone-assets] skip ${j.name} (no source)`);
      continue;
    }
    console.error(`[copy-standalone-assets] missing required source: ${j.src}`);
    process.exit(1);
  }
  await rm(j.dst, { recursive: true, force: true });
  await cp(j.src, j.dst, { recursive: true, dereference: true });
  const s = await stat(j.dst);
  console.log(`[copy-standalone-assets] ${j.name} -> ${j.dst} (${s.isDirectory() ? "dir" : "file"})`);
}

console.log("[copy-standalone-assets] done");
