import {UnifiedLoad} from "./unifiedLoad";
function key(x:UnifiedLoad){
 return `${x.provider}:${x.externalId}`;
}
function near(a:number,b:number,t:number){return Math.abs(a-b)<=t}
export function dedupeLoads(loads:UnifiedLoad[]){
 const out:UnifiedLoad[]=[];
 for(const x of loads){
  const exact=out.find(y=>key(y)===key(x));
  if(exact)continue;
  const duplicate=out.find(y=>
   near(y.pickup.lat,x.pickup.lat,.03)&&near(y.pickup.lon,x.pickup.lon,.03)&&
   near(y.delivery.lat,x.delivery.lat,.03)&&near(y.delivery.lon,x.delivery.lon,.03)&&
   Math.abs(y.priceEur-x.priceEur)<25
  );
  if(!duplicate)out.push(x);
 }
 return out;
}
