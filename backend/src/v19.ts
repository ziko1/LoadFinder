import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, ensureDriver } from './db';
import { authenticate } from './v13';

const Location = z.object({
  lat: z.number().finite().min(-90).max(90),
  lon: z.number().finite().min(-180).max(180),
  capturedAt: z.string().datetime({ offset: true }).optional()
});

/** V19: canonical driver-position endpoint with timestamp validation. */
export function registerV19(app: FastifyInstance) {
  app.post('/v19/driver/location', async (req, reply) => {
    try {
      const user = await authenticate(req);
      const b = Location.parse(req.body ?? {});
      if (!process.env.DATABASE_URL) return reply.code(503).send({ error: 'database_required' });
      await ensureDriver(user.driverId);
      const capturedAt = b.capturedAt ? new Date(b.capturedAt) : new Date();
      if (capturedAt.getTime() > Date.now() + 60_000) {
        return reply.code(400).send({ error: 'future_timestamp_not_allowed' });
      }
      const r = await pool.query(`
        insert into driver_search_positions(driver_id,position,captured_at)
        select id,ST_SetSRID(ST_MakePoint($2,$1),4326)::geography,$4
        from drivers where external_subject=$3
        on conflict(driver_id) do update
          set position=excluded.position,captured_at=excluded.captured_at
        where driver_search_positions.captured_at <= excluded.captured_at
        returning captured_at`, [b.lat, b.lon, user.driverId, capturedAt]);
      if (!r.rowCount) return reply.code(404).send({ error: 'driver_not_found' });
      return { ok: true, capturedAt: r.rows[0].captured_at };
    } catch (e: any) {
      return reply.code(e.statusCode ?? 400).send({ error: e.message ?? 'location_failed' });
    }
  });
}
