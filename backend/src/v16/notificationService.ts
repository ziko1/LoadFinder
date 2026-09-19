import { Pool } from 'pg';
import type { UnifiedLoad } from '../v11/unifiedLoad';
import type { PushGateway } from '../push';

export class LoadNotificationService {
  constructor(private readonly pool: Pool, private readonly push: PushGateway) {}

  async notifyNewMatches(driverId: string, loads: Array<UnifiedLoad & { score?: number; profitEur?: number }>, max = 10) {
    let sent = 0;
    for (const load of loads.slice(0, max)) {
      const inserted = await this.pool.query(`insert into load_notifications(driver_id,provider,external_id)
        values($1,$2,$3) on conflict(driver_id,provider,external_id) do nothing returning id`,
        [driverId, load.provider, load.externalId]);
      if (!inserted.rowCount) continue;
      try {
        const score = load.score == null ? '' : ` Score ${Math.round(load.score)}/100.`;
        const profit = load.profitEur == null ? '' : ` Profit €${load.profitEur.toFixed(0)}.`;
        await this.push.send(driverId, {
          title: 'LoadFinder: новий вантаж',
          body: `${load.pickup.lat.toFixed(3)},${load.pickup.lon.toFixed(3)} → ${load.delivery.lat.toFixed(3)},${load.delivery.lon.toFixed(3)}.${score}${profit}`,
          loadId: `${load.provider}:${load.externalId}`,
          deepLink: `loadfinder://load/${encodeURIComponent(load.provider)}/${encodeURIComponent(load.externalId)}`
        });
        await this.pool.query('update load_notifications set sent_at=now(), error=null where id=$1',[inserted.rows[0].id]);
        sent++;
      } catch (e: any) {
        await this.pool.query('update load_notifications set error=$2 where id=$1',[inserted.rows[0].id,String(e?.message ?? e)]);
      }
    }
    return sent;
  }
}
