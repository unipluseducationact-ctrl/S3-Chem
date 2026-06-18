import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

mkdirSync(join(dist, 'public'), { recursive: true });

for (const dir of ['notes', 'summary']) {
  cpSync(join(root, 'public', dir), join(dist, 'public', dir), { recursive: true });
}

writeFileSync(join(dist, '.nojekyll'), '');
