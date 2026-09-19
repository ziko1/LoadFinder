import {DriverStateController} from "./driverStateController";
export function registerDriverRoutes(app:any){
 const state=new DriverStateController();
 app.post("/v1/driver/route",async(req:any)=>state.set(req.body));
 app.get("/v1/driver/route/:driverId",async(req:any)=>state.get(req.params.driverId));
 app.post("/v1/driver/route/position",async(req:any)=>{
  const b=req.body??{};
  if(!b.driverId||!Number.isFinite(b.lat)||!Number.isFinite(b.lon))
   return {error:"invalid_position"};
  return state.position(String(b.driverId),{lat:Number(b.lat),lon:Number(b.lon)});
 });
}
