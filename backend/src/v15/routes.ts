import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../v13';
import { SearchQueue } from './redisQueue';

const Body = z.object({ lat:z.number().finite(), lon:z.number().finite(), radiusKm:z.number().positive().max(250).default(100) });

export function registerV15Routes(app: FastifyInstance) {
  const queue = new SearchQueue();
  app.post('/v15/auto-search/enqueue', async (req, reply) => {
    try {
      const user = await authenticate(req);
      const b = Body.parse(req.body ?? {});
      await queue.enqueue({driverExternalSubject:user.driverId, ...b});
      return {queued:true, driverId:user.driverId};
    } catch (e:any) { return reply.code(e.statusCode ?? 400).send({error:e.message ?? 'enqueue_failed'}); }
  });
}
