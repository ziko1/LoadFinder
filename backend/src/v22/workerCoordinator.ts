export function shouldStart(lastRunMs:number,cooldownMs:number,nowMs:number){
  return nowMs-lastRunMs>=cooldownMs;
}
export function nextLease(nowMs:number,leaseMs:number){
  return new Date(nowMs+leaseMs).toISOString();
}
