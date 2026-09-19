import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";

describe("v54 normalized detail contract",()=>{
  it("exposes provider-aware load details",()=>{
    const s=readFileSync(new URL("../src/server.ts",import.meta.url),"utf8");
    expect(s).toContain('app.get<{ Params: { loadId: string } }>("/v1/loads/:loadId"');
    expect(s).toContain('getProposalDetails(user.driverId, externalId)');
    expect(s).toContain('`trans.eu:${externalId}`');
  });
  it("Android API has a detail endpoint",()=>{
    const s=readFileSync(new URL("../../android/app/app/src/main/java/com/loadfinder/app/data/api/BackendApi.kt",import.meta.url),"utf8");
    expect(s).toContain('suspend fun loadDetails(@Path("id") id: String): ApiLoadDetails');
  });
});
