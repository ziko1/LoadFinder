import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
describe("v55 normalized detail",()=>{
  it("returns typed load fields and negotiation metadata",()=>{
    const s=readFileSync(new URL("../src/server.ts",import.meta.url),"utf8");
    for (const x of ["pickupCity","deliveryCity","weightKg","vehicleType","pricePerKm","offerId","version"]) expect(s).toContain(x);
  });
  it("Android detail no longer performs a second broad search",()=>{
    const s=readFileSync(new URL("../../android/app/app/src/main/java/com/loadfinder/app/data/exchange/BackendExchangeAdapter.kt",import.meta.url),"utf8");
    expect(s).toContain("api.loadDetails(loadId)");
    expect(s).not.toContain("api.loads(");
  });
});
