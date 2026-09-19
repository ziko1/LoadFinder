import {UnifiedExchangeSearch} from "./exchangeAggregator";
import {rank} from "./service";

export function registerUnifiedSearch(app:any,engine:UnifiedExchangeSearch){
 app.post("/v1/search/unified",async(req:any)=>{
  const b=req.body??{};
  if(!Number.isFinite(b.lat)||!Number.isFinite(b.lon))return {error:"invalid_location"};
  const loads=await engine.search({lat:Number(b.lat),lon:Number(b.lon),radiusKm:Number(b.radiusKm??100)});
  return rank({lat:Number(b.lat),lon:Number(b.lon)},loads,b);
 });
}
