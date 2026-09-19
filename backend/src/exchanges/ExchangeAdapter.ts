import {Load, SearchParams} from "../types";

export interface ExchangeAdapter {
  name: string;
  searchLoads(p: SearchParams): Promise<Load[]>;
  getLoadDetails(id:string): Promise<Load|null>;
  submitOffer(id:string, amountEur:number): Promise<{offerId:string}>;
  acceptLoad(id:string): Promise<{bookingId:string}>;
}