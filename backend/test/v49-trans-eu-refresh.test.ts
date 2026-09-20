import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";

describe("v49 Trans.eu refresh lifecycle",()=>{
  it("stores refresh token fields in the production schema",()=>{
    const sql=readFileSync(new URL("../sql/002_trans_eu_refresh_tokens.sql",import.meta.url),"utf8");
    for(const x of ["refresh_token_enc","refresh_token_iv","refresh_token_tag"]) expect(sql).toContain(x);
  });
  it("uses the documented refresh grant endpoint",()=>{
    const source=readFileSync(new URL("../src/integrations/transEu/transEuClient.ts",import.meta.url),"utf8");
    expect(source).toContain('grant_type: "refresh_token"');
    expect(source).toContain("/ext/auth-api/accounts/token");
    expect(source).toContain('Api-key');
  });
});
