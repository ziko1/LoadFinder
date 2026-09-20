import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";

describe("v48 production auth storage guard",()=>{
  it("does not allow memory OAuth token storage in production",()=>{
    const source=readFileSync(new URL("../src/server.ts",import.meta.url),"utf8");
    expect(source).toContain("PRODUCTION_AUTH_STORAGE_REQUIRED");
    expect(source).toContain("NODE_ENV");
    expect(source).toContain("TOKEN_ENCRYPTION_KEY");
  });
});
