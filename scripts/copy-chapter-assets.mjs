import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// Mirror public/ under dist/public/ so built and branch-served sites share the same paths.
cpSync(join(root, 'public'), join(dist, 'public'), { recursive: true });
writeFileSync(join(dist, '.nojekyll'), '');

// Embedded worksheet iframes link to ../../../css/worksheet-styles.css from public/worksheets/ch5-*.
const worksheetStyles = join(root, 'css', 'worksheet-styles.css');
for (const cssDir of [join(dist, 'css'), join(dist, 'public', 'css')]) {
  mkdirSync(cssDir, { recursive: true });
  cpSync(worksheetStyles, join(cssDir, 'worksheet-styles.css'));
}
