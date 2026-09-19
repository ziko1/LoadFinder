import fs from 'node:fs';
import assert from 'node:assert/strict';
for (const f of ['backend/src/v14.ts','backend/src/server.ts','backend/src/v14Persistence.ts','backend/sql/v14_production.sql']) {
  const s=fs.readFileSync(new URL(`./${f}`, import.meta.url),'utf8');
  assert(s.length>50, `empty ${f}`);
}
const sql=fs.readFileSync(new URL('./backend/sql/v14_production.sql', import.meta.url),'utf8');
assert(sql.includes('trans_eu_connections') && sql.includes('auto_bid_events') && sql.includes('push_tokens'));
console.log('LoadFinder v14 static validation: OK');
