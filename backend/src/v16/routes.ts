import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../v13';
import {ensureDriver} from '../db';
import { pool } from '../db';
import { SearchQueue } from '../v15/redisQueue';

const Location = z.object({lat:z.number().finite().min(-90).max(90),lon:z.number().finite().min(-180).max(180)});
const State = z.object({enabled:z.boolean(),radiusKm:z.number().int().positive().max(250).default(100),intervalSeconds:z.number().int().min(60).max(3600).default(60),maxNotificationsPerRun:z.number().int().min(0).max(50).default(10)});

export function registerV16Routes(app: FastifyInstance) {
  const queue = new SearchQueue();
  app.addHook('onClose',async()=>queue.close());
  app.post('/v16/driver/location', async (req, reply) => {
    try {
      const user = await authenticate(req); const b = Location.parse(req.body ?? {});
      await ensureDriver(user.driverId);
      await pool.query(`insert into driver_search_positions(driver_id,position,captured_at)
        select id,ST_SetSRID(ST_MakePoint($2,$1),4326)::geography,now() from drivers where external_subject=$3
        on conflict(driver_id) do update set position=excluded.position,captured_at=excluded.captured_at`,[b.lat,b.lon,user.driverId]);
      return {ok:true};
    } catch(e:any){ return reply.code(e.statusCode??400).send({error:e.message??'location_failed'}); }
  });
  app.put('/v16/auto-search/state', async (req, reply) => {
    try {
      const user=await authenticate(req); const b=State.parse(req.body??{});
      await ensureDriver(user.driverId);
      await pool.query(`insert into auto_search_state(driver_id,enabled,radius_km,interval_seconds,max_notifications_per_run,next_run_at)
        select id,$2,$3,$4,$5,case when $2 then now() else null end from drivers where external_subject=$1
        on conflict(driver_id) do update set enabled=excluded.enabled,radius_km=excluded.radius_km,interval_seconds=excluded.interval_seconds,max_notifications_per_run=excluded.max_notifications_per_run,
        next_run_at=case when excluded.enabled then now() else null end,updated_at=now()`,[user.driverId,b.enabled,b.radiusKm,b.intervalSeconds,b.maxNotificationsPerRun]);
      return {ok:true,enabled:b.enabled};
    } catch(e:any){ return reply.code(e.statusCode??400).send({error:e.message??'state_failed'}); }
  });
  app.post('/v16/auto-search/wake', async (req, reply) => {
    try { const user=await authenticate(req); const r=await pool.query(`select d.external_subject,ST_Y(p.position::geometry) lat,ST_X(p.position::geometry) lon,s.radius_km radiusKm from drivers d join auto_search_state s on s.driver_id=d.id join driver_search_positions p on p.driver_id=d.id where d.external_subject=$1 and s.enabled=true`,[user.driverId]); if(!r.rowCount) return reply.code(404).send({error:'auto_search_not_ready'}); await queue.enqueue({driverExternalSubject:String(r.rows[0].external_subject),lat:Number(r.rows[0].lat),lon:Number(r.rows[0].lon),radiusKm:Number(r.rows[0].radiuskm)}); return {queued:true}; }
    catch(e:any){return reply.code(e.statusCode??400).send({error:e.message??'wake_failed'});}
  });
}
