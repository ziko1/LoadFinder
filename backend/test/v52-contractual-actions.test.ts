import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";

describe("v52 contractual action safety",()=>{
  it("server routes require explicit confirmation",()=>{
    const s=readFileSync(new URL("../src/server.ts",import.meta.url),"utf8");
    expect(s).toContain('/v1/loads/:loadId/offer');
    expect(s).toContain('/v1/loads/:loadId/accept');
    expect((s.match(/explicit_confirmation_required/g)||[]).length).toBeGreaterThanOrEqual(4);
  });
  it("Android adapter does not auto-confirm",()=>{
    const s=readFileSync(new URL("../../android/app/app/src/main/java/com/loadfinder/app/data/exchange/BackendExchangeAdapter.kt",import.meta.url),"utf8");
    expect(s).toContain('require(confirmed) { "EXPLICIT_CONFIRMATION_REQUIRED" }');
  });
});
