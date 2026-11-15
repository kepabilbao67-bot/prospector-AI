import test from "node:test";
import assert from "node:assert/strict";
import { supabaseAuthConfig, verifySupabasePassword, registerSupabaseOwner } from "../src/lib/supabase-auth.ts";

const saved = { ...process.env };
const originalFetch = globalThis.fetch;
function configure() {
  process.env.PROSPECTOR_SUPABASE_URL = "https://igimtszomsyqakvepgyo.supabase.co";
  process.env.PROSPECTOR_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qa_test_only";
  process.env.PROSPECTOR_OWNER_EMAIL = "owner@example.invalid";
}
test.after(() => { process.env = saved; globalThis.fetch = originalFetch; });
test("Supabase provider requires validated URL and key", () => {
  configure();
  assert.equal(supabaseAuthConfig()?.owner, "owner@example.invalid");
  process.env.PROSPECTOR_SUPABASE_URL = "https://evil.example";
  assert.equal(supabaseAuthConfig(), null);
  configure();
});
test("Never call provider for another user's email", async () => {
  configure();
  globalThis.fetch = () => { throw Error("must not fetch"); };
  assert.equal(await verifySupabasePassword("pedro@example.invalid", "valid_pass"), "invalid");
});
test("Only confirmed owner may be authenticated", async () => {
  configure();
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    assert.equal(options.method, "POST");
    const body = JSON.parse(options.body);
    assert.equal(body.email, "owner@example.invalid");
    return new Response(JSON.stringify({access_token:"temporary", user:{id:"test-id",email:"owner@example.invalid",email_confirmed_at:"2026-11-15T11:00:00Z"}}),{status:200});
  };
  assert.equal(await verifySupabasePassword("OWNER@example.invalid","test"),"ok");
  assert.equal(calls,1);
});
test("Reject unconfirmed and mismatched provider identities", async () => {
  configure();
  globalThis.fetch=async()=>new Response(JSON.stringify({access_token:"temporary",user:{id:"1",email:"pedro@example.invalid",email_confirmed_at:"2026-11-15"}}),{status:200});
  assert.equal(await verifySupabasePassword("owner@example.invalid","wrong"),"invalid");
  globalThis.fetch=async()=>new Response(JSON.stringify({access_token:"temporary",user:{id:"1",email:"owner@example.invalid",email_confirmed_at:null}}),{status:200});
  assert.equal(await verifySupabasePassword("owner@example.invalid","wrong"),"invalid");
});
test("Wrong password is 401 and unavailable is fail closed", async () => {
  configure();
  globalThis.fetch=async()=>new Response(JSON.stringify({error:"invalid_credentials"}),{status:400});
  assert.equal(await verifySupabasePassword("owner@example.invalid","wrong"),"invalid");
  globalThis.fetch=async()=>{throw Error("offline")};
  assert.equal(await verifySupabasePassword("owner@example.invalid","test"),"unavailable");
});
test("Only configured owner can request signup", async () => {
  configure();
  globalThis.fetch = () => { throw Error("unexpected network call"); };
  assert.equal(await registerSupabaseOwner("pedro@example.invalid", "some-very-long-and-secure-password"), "invalid");
  assert.equal(await registerSupabaseOwner("owner@example.invalid", "short"), "invalid");
});
test("Owner-only signup calls Supabase Auth and respects rate limits", async () => {
  configure();
  let calls=0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.ok(url.endsWith("/auth/v1/signup"));
    assert.equal(JSON.parse(options.body).email,"owner@example.invalid");
    return new Response("{}",{status:200});
  };
  assert.equal(await registerSupabaseOwner("owner@example.invalid", "very-long-qa-password-12345678"),"sent");
  assert.equal(calls,1);
  globalThis.fetch = async () => new Response("{}",{status:429});
  assert.equal(await registerSupabaseOwner("owner@example.invalid", "very-long-qa-password-12345678"),"rate_limited");
});
