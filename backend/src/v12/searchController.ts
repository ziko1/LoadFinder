import {UnifiedExchangeSearch} from "../v11/exchangeAggregator";
import {rank} from "../v11/service";

export async function unifiedSearch(engine:UnifiedExchangeSearch,b:any){
 const lat=Number(b.lat),lon=Number(b.lon);
 if(!Number.isFinite(lat)||!Number.isFinite(lon))throw new Error("INVALID_LOCATION");
 const radius=Math.min(Math.max(Number(b.radiusKm??100),1),250);
 const loads=await engine.search({lat,lon,radiusKm:radius});
 return rank({lat,lon},loads,b).slice(0,100);
}
