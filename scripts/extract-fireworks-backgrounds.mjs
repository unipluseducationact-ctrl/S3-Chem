import { Buffer } from 'node:buffer';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const embeddedPath = join(root, 'public/tools/flame-test-fireworks/js/background-scenes-embedded.js');
const outDir = join(root, 'public/tools/flame-test-fireworks/assets/backgrounds');

const FILENAMES = {
  'city-skyline': 'city-skyline.jpg',
  'city-skyline-1': 'city-skyline-1.jpg',
  'city-skyline-2': 'city-skyline-2.jpg',
  'city-skyline-3': 'city-skyline-3.jpg',
  'city-skyline-4': 'city-skyline-4.jpg',
  'city-skyline-5': 'city-skyline-5.jpg',
};

const source = readFileSync(embeddedPath, 'utf8').replace(
  'const SCENE_DATA_URLS',
  'globalThis.SCENE_DATA_URLS',
);
// eslint-disable-next-line no-eval
eval(source);

mkdirSync(outDir, { recursive: true });

for (const [id, url] of Object.entries(globalThis.SCENE_DATA_URLS)) {
  const match = url.match(/^data:image\/\w+;base64,(.+)$/);
  if (!match) throw new Error(`Unexpected data URL for ${id}`);
  const file = join(outDir, FILENAMES[id] || `${id}.jpg`);
  writeFileSync(file, Buffer.from(match[1], 'base64'));
  console.log('wrote', file);
}
