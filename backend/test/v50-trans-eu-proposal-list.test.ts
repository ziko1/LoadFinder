import {describe,it,expect} from "vitest";
import {normalizeTransEuProposal} from "../src/integrations/transEu/proposalNormalizer";
import {readFileSync} from "node:fs";

describe("v50 Trans.eu proposal list",()=>{
  it("normalizes the documented EUR proposal shape",()=>{
    const row={
      id:"proposal-1",
      decision_date:"2026-03-26T08:00:00+01:00",
      freight:{
        id:3891981,
        distance:1219000,
        requirements:{vehicle_size_id:"solo"},
        spots:[
          {place:{coordinates:{latitude:45.397205283,longitude:9.21659417}}},
          {place:{coordinates:{latitude:53.389142217,longitude:14.514850097}}}
        ]
      },
      publication:{price:{currency:"eur",value:650}}
    };
    const x=normalizeTransEuProposal(row);
    expect(x?.provider).toBe("trans.eu");
    expect(x?.externalId).toBe("proposal-1");
    expect(x?.priceEur).toBe(650);
    expect(x?.distanceKm).toBe(1219);
  });

  it("rejects unsupported currencies instead of inventing an FX conversion",()=>{
    const row={id:"p",freight:{spots:[
      {place:{coordinates:{latitude:1,longitude:2}}},
      {place:{coordinates:{latitude:3,longitude:4}}}
    ]},publication:{price:{currency:"pln",value:145}}};
    expect(normalizeTransEuProposal(row)).toBeNull();
  });

  it("uses the official list endpoint and query modifiers",()=>{
    const source=readFileSync(new URL("../src/integrations/transEu/transEuClient.ts",import.meta.url),"utf8");
    expect(source).toContain("/ext/freights-api/v2/freight-proposals?");
    expect(source).toContain("sortBy");
    expect(source).toContain("order");
    expect(source).toContain("page");
  });
});
