import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../v13';
import { pool, ensureDriver } from '../db';

const State = z.object({
  enabled: z.boolean(),
  radiusKm: z.number().int().positive().max(250).default(100),
  intervalSeconds: z.number().int().min(60).max(3600).default(60),
  maxNotificationsPerRun: z.number().int().min(0).max(50).default(10)
});
const Location = z.object({lat:z.number().finite().min(-90).max(90),lon:z.number().finite().min(-180).max(180)});

export function registerV17Routes(app: FastifyInstance) {
  app.put('/v17/auto-search/state', async (req, reply) => {
    try {
      const user = await authenticate(req); const b = State.parse(req.body ?? {});
      await ensureDriver(user.driverId);
      const r = await pool.query(`
        insert into auto_search_state(driver_id,enabled,radius_km,interval_seconds,max_notifications_per_run,next_run_at)
        select id,$2,$3,$4,$5,case when $2 then now() else null end from drivers where external_subject=$1
        on conflict(driver_id) do update set enabled=excluded.enabled,radius_km=excluded.radius_km,
          interval_seconds=excluded.interval_seconds,max_notifications_per_run=excluded.max_notifications_per_run,
          next_run_at=case when excluded.enabled then now() else null end,updated_at=now()
        returning enabled,radius_km,interval_seconds,max_notifications_per_run,next_run_at`,
        [user.driverId,b.enabled,b.radiusKm,b.intervalSeconds,b.maxNotificationsPerRun]);
      if (!r.rowCount) return reply.code(404).send({error:'DRIVER_NOT_FOUND'});
      return {ok:true,state:r.rows[0]};
    } catch(e:any) { return reply.code(e.statusCode??400).send({error:e.message??'state_failed'}); }
  });

  app.post('/v17/driver/location', async (req, reply) => {
    try {
      const user = await authenticate(req); const b = Location.parse(req.body ?? {});
      await ensureDriver(user.driverId);
      const r = await pool.query(`
        insert into driver_search_positions(driver_id,position,captured_at)
        select id,ST_SetSRID(ST_MakePoint($2,$1),4326)::geography,now()
        from drivers where external_subject=$3
        on conflict(driver_id) do update set position=excluded.position,captured_at=excluded.captured_at
        returning captured_at`, [b.lat,b.lon,user.driverId]);
      if (!r.rowCount) return reply.code(404).send({error:'DRIVER_NOT_FOUND'});
      return {ok:true,capturedAt:r.rows[0].captured_at};
    } catch(e:any) { return reply.code(e.statusCode??400).send({error:e.message??'location_failed'}); }
  });

  app.get('/v17/auto-search/status', async (req, reply) => {
    try {
      const user=await authenticate(req);
      await ensureDriver(user.driverId);
      const r=await pool.query(`
        select st.enabled,st.radius_km,st.interval_seconds,st.max_notifications_per_run,st.last_run_at,st.next_run_at,
               p.captured_at,ST_Y(p.position::geometry) lat,ST_X(p.position::geometry) lon
        from drivers d left join auto_search_state st on st.driver_id=d.id
        left join driver_search_positions p on p.driver_id=d.id where d.external_subject=$1`, [user.driverId]);
      if (!r.rowCount) return reply.code(404).send({error:'DRIVER_NOT_FOUND'});
      return {status:r.rows[0]};
    } catch(e:any) { return reply.code(e.statusCode??400).send({error:e.message??'status_failed'}); }
  });
}
