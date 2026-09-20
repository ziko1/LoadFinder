export type HealthResult={service:string;ok:boolean;details?:unknown};
export async function healthChecks(checks:Record<string,()=>Promise<unknown>|unknown>){
 const out:Record<string,HealthResult>={};
 for(const [name,fn] of Object.entries(checks)){
  try{out[name]={service:name,ok:true,details:await fn()}}
  catch(e){out[name]={service:name,ok:false,details:String(e)}}
 }
 return out;
}
