import { pool } from '../db';
import { config } from '../config';
import { UnifiedExchangeSearch } from '../v11/exchangeAggregator';
import { MockAdapter } from '../exchanges/MockAdapter';
import { TransEuClient, MemoryAccessTokenStore } from '../integrations/transEu/transEuClient';
import { TransEuUnifiedProvider } from '../exchanges/TransEuUnifiedProvider';
import { EncryptedTokenStore } from '../v14';
import { rank } from '../v11/ranking';
import { LoadRepository } from '../v15/loadRepository';
import { SearchQueue, type SearchJob } from '../v15/redisQueue';
import { LogPushGateway } from '../push';
import { ReliableLoadNotificationService } from './notificationService';
import { v17Config } from './config';
import { loadRankingConfig } from '../v16/searchConfig';

const mock = new MockAdapter();
const tokens = config.databaseUrl && process.env.TOKEN_ENCRYPTION_KEY
  ? new EncryptedTokenStore()
  : new MemoryAccessTokenStore();
const transEu = new TransEuClient(tokens);
const transEuProvider = new TransEuUnifiedProvider(transEu);
const providers = [
  transEuProvider,
  ...(String(process.env.LOADFINDER_ENABLE_MOCK_PROVIDER ?? "false") === "true" ? [{
    name: "mock" as const,
    async search(input: {lat:number;lon:number;radiusKm:number}) {
      const rows = await mock.searchLoads({ ...input });
      return rows.map(x => ({
        provider: "mock" as const, externalId: x.id, pickup: x.pickup, delivery: x.delivery,
        pickupTime: undefined, priceEur: x.priceEur, distanceKm: x.distanceKm,
        vehicleCompatible: true, raw: x
      }));
    }
  }] : [])
];
const engine = new UnifiedExchangeSearch(providers);

const queue = new SearchQueue(config.redisUrl || undefined);
const repo = new LoadRepository(pool);
const notifications = new ReliableLoadNotificationService(pool, new LogPushGateway());
const rankingConfig = loadRankingConfig();

async function runJob(job: SearchJob) {
  const driver = await pool.query('select id from drivers where external_subject=$1', [job.driverExternalSubject]);
  const driverId = driver.rows[0]?.id as string | undefined;
  if (!driverId) return { skipped: true, reason: 'DRIVER_NOT_FOUND' };

  const run = await pool.query('insert into auto_search_runs(driver_id) values($1) returning id', [driverId]);
  const runId = run.rows[0].id;
  try {
    const loads = await engine.search({ lat: job.lat, lon: job.lon, radiusKm: job.radiusKm }, job.driverExternalSubject);
    const ranked = rank({ lat: job.lat, lon: job.lon }, loads, rankingConfig);
    for (const load of ranked.slice(0, 100)) await repo.upsert(load);
    const state = await pool.query('select max_notifications_per_run from auto_search_state where driver_id=$1', [driverId]);
    const notified = await notifications.notifyNewMatches(driverId, ranked, Number(state.rows[0]?.max_notifications_per_run ?? 10));
    await pool.query('update auto_search_runs set finished_at=now(),found_count=$2,notified_count=$3 where id=$1', [runId, ranked.length, notified]);
    return { skipped: false, found: ranked.length, notified };
  } catch (e: any) {
    await pool.query('update auto_search_runs set finished_at=now(),error=$2 where id=$1', [runId, String(e?.message ?? e)]);
    throw e;
  }
}

async function scheduleDue() {
  const client = await pool.connect();
  const jobs: SearchJob[] = [];
  try {
    await client.query('begin');
    const { rows } = await client.query(`
      select d.id,d.external_subject,
             st.radius_km,
             st.interval_seconds,
             ST_Y(p.position::geometry) lat,
             ST_X(p.position::geometry) lon
      from auto_search_state st
      join drivers d on d.id=st.driver_id
      join driver_search_positions p on p.driver_id=d.id
      where st.enabled=true
        and (st.next_run_at is null or st.next_run_at <= now())
        and p.captured_at >= now() - make_interval(mins => $1)
      order by coalesce(st.next_run_at,to_timestamp(0))
      for update of st skip locked
      limit $2`, [v17Config.AUTO_SEARCH_STALE_POSITION_MINUTES, v17Config.AUTO_SEARCH_BATCH]);

    for (const r of rows) {
      jobs.push({ driverExternalSubject: String(r.external_subject), lat: Number(r.lat), lon: Number(r.lon), radiusKm: Number(r.radius_km) });
      await client.query(`update auto_search_state set last_run_at=now(),next_run_at=now()+make_interval(secs => $2),updated_at=now() where driver_id=$1`, [r.id, Number(r.interval_seconds)]);
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally { client.release(); }
  for (const job of jobs) await queue.enqueue(job);
  return jobs.length;
}

async function main() {
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGTERM', stop); process.once('SIGINT', stop);

  const loop = async () => {
    while (!controller.signal.aborted) {
      try {
        await scheduleDue();
        const job = await queue.dequeue(1);
        if (job) await runJob(job);
      } catch (e) { console.error('loadfinder-v17-worker', e); }
      await new Promise(r => setTimeout(r, v17Config.AUTO_SEARCH_INTERVAL_MS));
    }
  };

  try { await loop(); }
  finally { await queue.close(); await pool.end(); }
}

main().catch(e => { console.error(e); process.exit(1); });
