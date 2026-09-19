import fs from 'node:fs';
import path from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const sql = fs.readFileSync(path.join(root,'backend/sql/v18_production.sql'),'utf8');
const compose = fs.readFileSync(path.join(root,'docker-compose.yml'),'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root,'backend/package.json'),'utf8'));

const requiredTables = [
  'driver_search_positions', 'auto_search_state', 'auto_search_runs',
  'load_snapshots', 'load_notifications', 'auto_search_job_outbox'
];
for (const t of requiredTables) {
  if (!new RegExp(`CREATE TABLE IF NOT EXISTS ${t}\\b`, 'i').test(sql)) throw new Error(`missing table ${t}`);
}
if (!/CREATE EXTENSION IF NOT EXISTS pgcrypto/i.test(sql)) throw new Error('pgcrypto extension missing');
for (const service of ['postgres','redis','api','worker']) {
  if (!new RegExp(`^  ${service}:`, 'm').test(compose)) throw new Error(`compose service missing: ${service}`);
}
if (!/\n  worker:\n[\s\S]*?\n    depends_on:/m.test(compose)) throw new Error('worker block malformed');
if (pkg.scripts?.build !== 'tsc') throw new Error('build script changed unexpectedly');

const files = fs.readdirSync(path.join(root,'backend/src/v17'));
for (const f of ['config.ts','notificationService.ts','routes.ts','worker.ts']) if (!files.includes(f)) throw new Error(`missing v17 file ${f}`);
console.log('V18 structural audit: PASS');
