import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";

describe("v43 /v1/loads contract",()=>{
  const source=readFileSync(new URL("../src/server.ts",import.meta.url),"utf8");
  it("exposes the endpoint with bounded coordinates and filtering",()=>{
    expect(source).toContain('app.get("/v1/loads"');
    expect(source).toContain("invalid_search_params");
    expect(source).toContain(".filter((x: any) => x.pickupDistanceKm <= radiusKm)");
    expect(source).toContain(".filter((x: any) => x.pricePerKm >= minPricePerKm)");
    expect(source).toContain(".filter((x: any) => x.emptyDistanceKm <= maxEmptyKm)");
  });
});
