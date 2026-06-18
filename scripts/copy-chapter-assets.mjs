import { cpSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// Mirror public/ under dist/public/ so built and branch-served sites share the same paths.
cpSync(join(root, 'public'), join(dist, 'public'), { recursive: true });
writeFileSync(join(dist, '.nojekyll'), '');
