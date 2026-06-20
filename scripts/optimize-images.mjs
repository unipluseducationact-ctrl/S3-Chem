import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEBP_QUALITY = 82;

const GLOB_PATTERNS = [
  path.join(ROOT, "public/tools/lab-hazard-match/assets"),
  path.join(ROOT, "images"),
];

const IMAGE_NAME_PATTERNS = [
  /^interactive-tools-.*-preview\.png$/i,
  /^interactive-lab-.*-preview\.png$/i,
  /^preview-modal\.png$/i,
  /^mobile-atom-2\.png$/i,
  /^uniplus-logo\.png$/i,
];

async function collectPngFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectPngFiles(full)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      const relFromRoot = path.relative(ROOT, full).replace(/\\/g, "/");
      const isLabAsset = relFromRoot.startsWith("public/tools/lab-hazard-match/assets/");
      const isImagesPreview =
        relFromRoot.startsWith("images/") &&
        IMAGE_NAME_PATTERNS.some((re) => re.test(entry.name));
      if (isLabAsset || isImagesPreview) {
        results.push(full);
      }
    }
  }
  return results;
}

async function shouldSkip(pngPath, webpPath) {
  try {
    const [pngStat, webpStat] = await Promise.all([stat(pngPath), stat(webpPath)]);
    return webpStat.mtimeMs >= pngStat.mtimeMs;
  } catch {
    return false;
  }
}

async function convertOne(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");
  if (await shouldSkip(pngPath, webpPath)) {
    return { pngPath, skipped: true };
  }
  const pngStat = await stat(pngPath);
  await sharp(pngPath).webp({ quality: WEBP_QUALITY }).toFile(webpPath);
  const webpStat = await stat(webpPath);
  return {
    pngPath,
    skipped: false,
    beforeKB: Math.round(pngStat.size / 1024),
    afterKB: Math.round(webpStat.size / 1024),
  };
}

async function main() {
  const pngFiles = [];
  for (const dir of GLOB_PATTERNS) {
    pngFiles.push(...(await collectPngFiles(dir)));
  }
  pngFiles.sort();

  if (pngFiles.length === 0) {
    console.log("No PNG targets found.");
    return;
  }

  console.log(`Converting ${pngFiles.length} PNG(s) to WebP (quality ${WEBP_QUALITY})...`);
  let savedKB = 0;
  let converted = 0;
  let skipped = 0;

  for (const pngPath of pngFiles) {
    const rel = path.relative(ROOT, pngPath);
    const result = await convertOne(pngPath);
    if (result.skipped) {
      skipped += 1;
      console.log(`  skip  ${rel}`);
    } else {
      converted += 1;
      savedKB += result.beforeKB - result.afterKB;
      console.log(`  ok    ${rel}  ${result.beforeKB} KB -> ${result.afterKB} KB`);
    }
  }

  console.log(`Done: ${converted} converted, ${skipped} skipped, ~${savedKB} KB saved vs PNG originals.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});