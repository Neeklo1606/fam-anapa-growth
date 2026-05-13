/**
 * Запуск из apps/api: node scripts/knockout-logo-white.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, rename } from "node:fs/promises";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(__dirname, "../../web/public/img/logo.webp");
const tmp = `${input}.tmp`;
const buf = await readFile(input);
const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (!width || !height || channels !== 4) {
  throw new Error(`unexpected image info: ${width}x${height} ch=${channels}`);
}
const TH = 248;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r >= TH && g >= TH && b >= TH) data[i + 3] = 0;
}
await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile(tmp);
await rename(tmp, input);
console.log("Updated", input);
