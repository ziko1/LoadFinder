import {ExchangeAdapter} from "./ExchangeAdapter";
import {Load, SearchParams} from "../types";
import {distanceKm} from "../geo";

export class MockAdapter implements ExchangeAdapter {
  name="MOCK";
  async searchLoads(p:SearchParams):Promise<Load[]> {
    const base=[
      {id:"M1",pickupCity:"Berlin",pickup:{lat:52.52,lon:13.405},deliveryCity:"Brussels",delivery:{lat:50.85,lon:4.35},weightKg:1200,volumeM3:8,vehicleType:"VAN",priceEur:780,distanceKm:650},
      {id:"M2",pickupCity:"Potsdam",pickup:{lat:52.40,lon:13.06},deliveryCity:"Hamburg",delivery:{lat:53.55,lon:9.99},weightKg:800,volumeM3:5,vehicleType:"VAN",priceEur:620,distanceKm:290},
      {id:"M3",pickupCity:"Berlin",pickup:{lat:52.50,lon:13.40},deliveryCity:"Munich",delivery:{lat:48.14,lon:11.58},weightKg:1500,volumeM3:10,vehicleType:"TRUCK",priceEur:900,distanceKm:585}
    ];
    return base.map(x=>{
      const d=distanceKm(p,x.pickup);
      return {...x,pickupDistanceKm:d,emptyDistanceKm:d,pricePerKm:x.priceEur/x.distanceKm,matchScore:0,status:"AVAILABLE" as const,exchange:this.name};
    });
  }
  async getLoadDetails(id:string){ return (await this.searchLoads({lat:52.52,lon:13.405,radiusKm:100})).find(x=>x.id===id)||null; }
  async submitOffer(id:string, amountEur:number){ return {offerId:`MOCK-OFFER-${id}-${Math.round(amountEur)}`}; }
  async acceptLoad(id:string){ return {bookingId:`MOCK-BOOKING-${id}`}; }
}