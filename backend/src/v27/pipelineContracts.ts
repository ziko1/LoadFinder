export type LoadCandidate={id:string;score:number;profitEur:number};
export function rankCandidates(items:LoadCandidate[]){
  return [...items].sort((a,b)=>b.score-a.score || b.profitEur-a.profitEur);
}
export function selectNotified(items:LoadCandidate[],limit:number){
  if(!Number.isInteger(limit)||limit<1) throw new Error('invalid notification limit');
  return rankCandidates(items).slice(0,limit);
}
