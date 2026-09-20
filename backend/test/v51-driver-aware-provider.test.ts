import {describe,it,expect} from "vitest";
import {UnifiedExchangeSearch} from "../src/v11/exchangeAggregator";
import {readFileSync} from "node:fs";

describe("v51 driver-aware provider wiring",()=>{
  it("forwards driver id to providers",async()=>{
    let seen:string|undefined;
    const engine=new UnifiedExchangeSearch([{
      name:"trans.eu",
      async search(_input,driverId){seen=driverId;return[];}
    }]);
    await engine.search({lat:52,lon:13,radiusKm:50},"driver-123");
    expect(seen).toBe("driver-123");
  });
  it("keeps mock opt-in",()=>{
    const server=readFileSync(new URL("../src/server.ts",import.meta.url),"utf8");
    expect(server).toContain("LOADFINDER_ENABLE_MOCK_PROVIDER");
    expect(server).toContain("TransEuUnifiedProvider");
  });
  it("worker passes driver context",()=>{
    const worker=readFileSync(new URL("../src/v17/worker.ts",import.meta.url),"utf8");
    expect(worker).toContain('engine.search({ lat: job.lat, lon: job.lon, radiusKm: job.radiusKm }, job.driverExternalSubject)');
  });
});
