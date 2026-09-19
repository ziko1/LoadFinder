export function nextBackoff(attempt:number){
  return Math.min(60000,1000*Math.pow(2,attempt));
}
