import type {FastifyInstance} from 'fastify';
import {z} from 'zod';
import {DriverStateController, type Route} from './driverStateController';
import {authenticate, PgRepo} from './v13';
import {config} from './config';

const Point=z.object({lat:z.number().min(-90).max(90),lon:z.number().min(-180).max(180)});
const RouteBody=z.object({driverId:z.string().optional(),loadId:z.string().min(1),pickup:Point,delivery:Point,status:z.enum(['TO_PICKUP','LOADED','TO_DELIVERY','DELIVERED'])});

export function registerDriverRoutes(app:FastifyInstance){
  const state=new DriverStateController();
  const repo=config.databaseUrl?new PgRepo():undefined;
  app.addHook('onClose',async()=>{await repo?.pool.end();});
  async function read(subject:string){
    if(!repo) return state.get(subject);
    const r=await repo.pool.query('select payload from driver_routes where driver_id=(select id from drivers where external_subject=$1)',[subject]);
    return (r.rows[0]?.payload??null) as Route|null;
  }
  async function save(route:Route){
    if(!repo) return state.set(route);
    const id=await repo.ensureDriver(route.driverId);
    await repo.pool.query('insert into driver_routes(driver_id,payload) values($1,$2) on conflict(driver_id) do update set payload=excluded.payload,updated_at=now()', [id,JSON.stringify(route)]);
    return route;
  }
  app.post('/v1/driver/route',async(req,reply)=>{
    const user=await authenticate(req); const parsed=RouteBody.safeParse(req.body);
    if(!parsed.success)return reply.code(400).send({error:'invalid_route'});
    if(parsed.data.driverId && parsed.data.driverId!==user.driverId) return reply.code(403).send({error:'forbidden'});
    return save({...parsed.data,driverId:user.driverId});
  });
  app.get<{Params:{driverId:string}}>('/v1/driver/route/:driverId',async(req,reply)=>{
    const user=await authenticate(req);
    if(req.params.driverId!==user.driverId)return reply.code(403).send({error:'forbidden'});
    return read(user.driverId);
  });
  app.post('/v1/driver/route/position',async(req,reply)=>{
    const user=await authenticate(req);const parsed=Point.extend({driverId:z.string().optional()}).safeParse(req.body);
    if(!parsed.success)return reply.code(400).send({error:'invalid_position'});
    if(parsed.data.driverId && parsed.data.driverId!==user.driverId)return reply.code(403).send({error:'forbidden'});
    const route=await read(user.driverId); if(!route)return null;
    const transition=new DriverStateController(); transition.set(route);
    return save(transition.position(user.driverId,parsed.data)!);
  });
}
