import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('.', import.meta.url).pathname);
const required = [
  'backend/src/v16/worker.ts',
  'backend/src/v16/scheduler.ts',
  'backend/src/v16/notificationService.ts',
  'backend/src/v16/routes.ts',
  'backend/src/v16/searchConfig.ts',
  'backend/sql/v16/001_worker.sql',
];
for (const f of required) {
  if (!fs.existsSync(path.join(root, f))) throw new Error(`MISSING:${f}`);
}
const worker = fs.readFileSync(path.join(root,'backend/src/v16/worker.ts'),'utf8');
const scheduler = fs.readFileSync(path.join(root,'backend/src/v16/scheduler.ts'),'utf8');
if (worker.includes('rank({lat:job.lat,lon:job.lon}, loads, {} as any)')) throw new Error('UNSAFE_EMPTY_RANK_CONFIG');
if (!/FOR UPDATE OF\s+s\s+SKIP LOCKED/i.test(scheduler)) throw new Error('SCHEDULER_LOCK_MISSING');
if (!worker.includes('SIGTERM') || !worker.includes('SIGINT')) throw new Error('GRACEFUL_SHUTDOWN_MISSING');
console.log('V16 static audit: PASS');
