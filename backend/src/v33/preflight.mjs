import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../../', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(new URL('package.json', root), 'utf8'));
const required = {
  build: 'tsc -p tsconfig.build.json',
  start: 'node dist/server.js',
};
for (const [key, value] of Object.entries(required)) {
  if (pkg.scripts[key] !== value) throw new Error(`package.json scripts.${key} mismatch`);
}
if (!fs.existsSync(new URL('tsconfig.build.json', root))) throw new Error('tsconfig.build.json missing');
if (!fs.existsSync(new URL('Dockerfile', root))) throw new Error('Dockerfile missing');
console.log('LoadFinder v33 build/deploy contract: PASS');
