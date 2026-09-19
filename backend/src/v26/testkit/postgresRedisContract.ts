export type ServiceHealth={postgres:boolean; redis:boolean};
export function allServicesHealthy(h:ServiceHealth){return h.postgres && h.redis;}
export function requireTestServices(h:ServiceHealth){
  if(!allServicesHealthy(h)) throw new Error('integration services unavailable');
}
