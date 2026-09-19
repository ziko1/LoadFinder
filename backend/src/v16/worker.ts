import { pool } from '../db';
import { config } from '../config';
import { UnifiedExchangeSearch } from '../v11/exchangeAggregator';
import { MockAdapter } from '../exchanges/MockAdapter';
import { rank } from '../v11/ranking';
import { LoadRepository } from '../v15/loadRepository';
import { SearchQueue } from '../v15/redisQueue';
import { LogPushGateway } from '../push';
import { LoadNotificationService } from './notificationService';
import { AutoSearchScheduler } from './scheduler';
import { loadRankingConfig } from './searchConfig';

const mock = new MockAdapter();
const engine = new UnifiedExchangeSearch([{
  name: 'mock',
  async search(input) {
    const rows = await mock.searchLoads({ ...input });
    return rows.map(x => ({
      provider: 'mock' as const, externalId: x.id, pickup: x.pickup, delivery: x.delivery,
      pickupTime: undefined, priceEur: x.priceEur, distanceKm: x.distanceKm,
      vehicleCompatible: true, raw: x
    }));
  }
}]);

const queue = new SearchQueue(config.redisUrl || undefined);
const scheduler = new AutoSearchScheduler(pool, queue);
const notifications = new LoadNotificationService(pool, new LogPushGateway());
const repo = new LoadRepository(pool);
const rankingConfig = loadRankingConfig();

async function consume(signal: AbortSignal) {
  while (!signal.aborted) {
    const job = await queue.dequeue(5);
    if (!job || signal.aborted) continue;
    try {
      const d = await pool.query('select id from drivers where external_subject=$1', [job.driverExternalSubject]);
      const driverId = d.rows[0]?.id as string | undefined;
      if (!driverId) continue;

      const run = await pool.query(
        'insert into auto_search_runs(driver_id) values($1) returning id', [driverId]
      );
      const runId = run.rows[0].id;
      try {
        const loads = await engine.search({ lat: job.lat, lon: job.lon, radiusKm: job.radiusKm });
        const ranked = rank({ lat: job.lat, lon: job.lon }, loads, rankingConfig);
        for (const load of ranked.slice(0, 100)) await repo.upsert(load);

        const state = await pool.query(
          'select max_notifications_per_run from auto_search_state where driver_id=$1', [driverId]
        );
        const max = Number(state.rows[0]?.max_notifications_per_run ?? 10);
        const notified = await notifications.notifyNewMatches(driverId, ranked, max);
        await pool.query(
          'update auto_search_runs set finished_at=now(), found_count=$2, notified_count=$3 where id=$1',
          [runId, ranked.length, notified]
        );
      } catch (e: any) {
        await pool.query(
          'update auto_search_runs set finished_at=now(), error=$2 where id=$1',
          [runId, String(e?.message ?? e)]
        );
      }
    } catch (e) {
      console.error('auto-search-worker error', e);
    }
  }
}

async function main() {
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);

  const schedulerLoop = async () => {
    while (!controller.signal.aborted) {
      try { await scheduler.tick(); }
      catch (e) { console.error('scheduler error', e); }
      await new Promise(r => setTimeout(r, 5000));
    }
  };

  try {
    await Promise.all([consume(controller.signal), schedulerLoop()]);
  } finally {
    await scheduler.close();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
