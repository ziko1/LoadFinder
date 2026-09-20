import {NextLoadController} from './nextLoadController';
import {authenticate} from './v13';
import type {FastifyInstance} from 'fastify';
import {z} from 'zod';

export function registerV8Routes(app:FastifyInstance){
  const nextLoad=new NextLoadController();
  app.post('/v1/vehicle/position',async(req,reply)=>{
    const user=await authenticate(req);
    const parsed=z.object({driverId:z.string().optional(),lat:z.number().min(-90).max(90),lon:z.number().min(-180).max(180),accuracyM:z.number().nonnegative().optional(),speedKmh:z.number().nonnegative().optional(),headingDeg:z.number().min(0).max(360).optional()}).safeParse(req.body);
    if(!parsed.success)return reply.code(400).send({error:'invalid_position'});
    if(parsed.data.driverId && parsed.data.driverId!==user.driverId)return reply.code(403).send({error:'forbidden'});
    return nextLoad.updatePosition({...parsed.data,driverId:user.driverId,recordedAt:new Date().toISOString()});
  });
  app.post('/v1/webhooks/trans-eu/v8',async(_req,reply)=>reply.code(503).send({error:'webhooks_not_configured'}));
}
