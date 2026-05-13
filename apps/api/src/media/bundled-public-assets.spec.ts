import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  encodeBundledMediaId,
  isSafeBundledRelativePath,
  tryDecodeBundledMediaId,
} from "./bundled-public-assets";

describe("bundled-public-assets ids", () => {
  it("round-trips posix relative paths", () => {
    const rel = "img/my file.jpg";
    const id = encodeBundledMediaId(rel);
    expect(tryDecodeBundledMediaId(id)).toBe(path.posix.normalize(rel.replace(/\\/g, "/")));
  });

  it("rejects ordinary cuid-style ids", () => {
    expect(tryDecodeBundledMediaId("clxxxxxxxxxxxxxxxxxxxxxx")).toBeNull();
  });
});

describe("isSafeBundledRelativePath", () => {
  const root = path.resolve("/var/www/repo/apps/web/public");

  it("allows normal paths", () => {
    expect(isSafeBundledRelativePath("img/logo.webp", root)).toBe(true);
    expect(isSafeBundledRelativePath("hero.mp4", root)).toBe(true);
  });

  it("blocks traversal outside public", () => {
    expect(isSafeBundledRelativePath("../../../etc/passwd", root)).toBe(false);
    expect(isSafeBundledRelativePath("img/../../../etc/passwd", root)).toBe(false);
  });
});
