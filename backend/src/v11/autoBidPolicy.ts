export type AutoBidPolicy={
 enabled:boolean; minScore:number; minProfitEur:number;
 maxBidsPerHour:number; maxBidsPerDay:number; maxBidEur:number;
};
export function shouldBid(x:{score:number;profitEur:number},p:AutoBidPolicy){
 return p.enabled&&x.score>=p.minScore&&x.profitEur>=p.minProfitEur;
}
