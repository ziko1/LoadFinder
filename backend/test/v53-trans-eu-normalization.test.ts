import {describe,it,expect} from "vitest";
import {normalizeTransEuProposal} from "../src/integrations/transEu/proposalNormalizer";

describe("v53 Trans.eu normalization",()=>{
  it("maps cities, weight and vehicle body",()=>{
    const x=normalizeTransEuProposal({id:"offer-1",decision_date:"2026-09-18T10:00:00Z",price:{currency:"eur",value:900},freight:{distance:300000,capacity:{value:12},requirements:{vehicle_size_id:"solo",required_truck_bodies:["curtainsider"]},spots:[{place:{locality:"Berlin",coordinates:{latitude:52.52,longitude:13.405}}},{place:{locality:"Brussels",coordinates:{latitude:50.85,longitude:4.35}}}]}});
    expect(x).not.toBeNull(); expect(x!.raw.loadfinder).toMatchObject({pickupCity:"Berlin",deliveryCity:"Brussels",vehicleType:"CURTAINSIDER",weightKg:12000});
    expect(x!.vehicleCompatible).toBe(true);
  });
});
