import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";

describe("v47 driver location persistence contract",()=>{
  const source=readFileSync(new URL("../src/v13.ts",import.meta.url),"utf8");
  it("uses the production schema columns",()=>{
    expect(source).toContain("driver_locations(user_id,position,captured_at)");
    expect(source).not.toContain("driver_locations(driver_id,geom,accuracy_m,recorded_at)");
  });
});
