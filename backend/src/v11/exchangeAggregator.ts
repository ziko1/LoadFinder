import {UnifiedLoad} from "./unifiedLoad";
import {dedupeLoads} from "./dedupe";
export interface ExchangeSearchProvider{
 name:UnifiedLoad["provider"];
 search(input:{lat:number;lon:number;radiusKm:number}, driverId?:string):Promise<UnifiedLoad[]>;
}
export class UnifiedExchangeSearch{
 constructor(private providers:ExchangeSearchProvider[]){}
 async search(input:{lat:number;lon:number;radiusKm:number}, driverId?:string){
  const chunks=await Promise.allSettled(this.providers.map(p=>p.search(input, driverId)));
  const failures=chunks.flatMap((x,i)=>x.status==='rejected'?[this.providers[i].name]:[]);
  if(failures.length) throw Object.assign(new Error('EXCHANGE_UNAVAILABLE'), {statusCode:503, providers:failures});
  const loads=chunks.flatMap(x=>x.status==="fulfilled"?x.value:[]);
  return dedupeLoads(loads);
 }
}
