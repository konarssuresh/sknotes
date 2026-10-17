import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "app", "icon.svg");
const outDir = path.join(root, "public", "icons");

const sizes = [192, 512];

const svg = await readFile(svgPath);
await mkdir(outDir, { recursive: true });

for (const size of sizes) {
  const buffer = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(path.join(outDir, `icon-${size}.png`), buffer);
}

console.log(
  `Wrote ${sizes.map((s) => `icon-${s}.png`).join(", ")} to public/icons/`
);
