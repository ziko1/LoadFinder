import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('.', import.meta.url).pathname);
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const required = [
  'backend/src/v17/worker.ts',
  'backend/src/v17/routes.ts',
  'backend/src/v17/config.ts',
  'backend/src/v17/notificationService.ts',
  'backend/sql/v17/001_production_autosearch.sql',
  'backend/package.json',
];
for (const f of required) if (!fs.existsSync(path.join(root, f))) throw new Error(`MISSING:${f}`);

const worker = read('backend/src/v17/worker.ts');
const routes = read('backend/src/v17/routes.ts');
const sql = read('backend/sql/v17/001_production_autosearch.sql');
const compose = read('docker-compose.yml');
const server = read('backend/src/server.ts');
const pkg = JSON.parse(read('backend/package.json'));

if (worker.includes('{} as any')) throw new Error('UNSAFE_EMPTY_CONFIG');
if (!/FOR UPDATE OF\s+st\s+SKIP LOCKED/i.test(worker)) throw new Error('SCHEDULER_LOCK_MISSING');
if (!/captured_at\s+>=\s+now\(\)\s*-\s*make_interval/i.test(worker)) throw new Error('STALE_GPS_GUARD_MISSING');
if (!worker.includes('SIGTERM') || !worker.includes('SIGINT')) throw new Error('GRACEFUL_SHUTDOWN_MISSING');
if (!worker.includes('loadRankingConfig()')) throw new Error('RANKING_CONFIG_MISSING');
if (!routes.includes('DRIVER_NOT_FOUND')) throw new Error('DRIVER_GUARD_MISSING');
if (!server.includes('registerV17Routes(app)')) throw new Error('SERVER_ROUTE_NOT_WIRED');
if (pkg.scripts['worker:v17'] !== 'tsx src/v17/worker.ts') throw new Error('WORKER_SCRIPT_MISSING');
if (!compose.includes('command: npm run worker:v17')) throw new Error('DOCKER_WORKER_NOT_WIRED');

for (const table of ['load_snapshots','auto_search_state','auto_search_runs','load_notifications','driver_search_positions']) {
  if (!new RegExp(`create table if not exists ${table}`, 'i').test(sql)) throw new Error(`TABLE_MISSING:${table}`);
}
for (const col of ['next_run_at','max_notifications_per_run','attempts']) {
  if (!sql.includes(`add column if not exists ${col}`) && !sql.includes(` ${col} `)) throw new Error(`COLUMN_MISSING:${col}`);
}

// Check that every v17 SQL dependency is created by v12-v17 migrations.
const migrations = fs.readdirSync(path.join(root, 'backend/sql'))
  .filter(f => f.endsWith('.sql')).sort().map(f => read(`backend/sql/${f}`));
const all = migrations.join('\n');
for (const dep of ['drivers','trans_eu_connections','push_tokens','auto_bid_events']) {
  if (!new RegExp(`create table if not exists ${dep}`, 'i').test(all)) throw new Error(`BASE_DEPENDENCY_MISSING:${dep}`);
}
console.log('V17 static integration audit: PASS');
