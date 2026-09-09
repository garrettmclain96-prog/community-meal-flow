import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("public pilot intake does not require auth or a meeting", async () => {
  const route = await source("src/routes/pilot.tsx");

  assert.match(route, /submitPilotLead/);
  assert.match(route, /No phone number/);
  assert.match(route, /No\s+sales call/);
  assert.match(route, /No account just to say/);
  assert.match(route, /Raise my hand — no meeting/);
  assert.doesNotMatch(route, /useLegalGate/);
  assert.doesNotMatch(route, /PILOT_LIVE_DATE/);
  assert.doesNotMatch(route, /November 3, 2026/);
});

test("lead intake uses a bounded RPC without direct anonymous table writes", async () => {
  const fn = await source("src/lib/pilot.functions.ts");
  const schemaMigration = await source(
    "supabase/migrations/20260908222500_async_acquisition_intake.sql",
  );
  const rpcMigration = await source(
    "supabase/migrations/20260908224500_public_pilot_intake_rpc.sql",
  );

  assert.match(fn, /createServerFn/);
  assert.match(fn, /submit_public_pilot_lead/);
  assert.match(fn, /website/);
  assert.doesNotMatch(fn, /supabaseAdmin/);
  assert.match(schemaMigration, /ALTER COLUMN user_id DROP NOT NULL/i);
  assert.match(schemaMigration, /do_not_contact boolean NOT NULL DEFAULT false/i);
  assert.match(schemaMigration, /followup_count integer NOT NULL DEFAULT 0/i);
  assert.doesNotMatch(
    schemaMigration,
    /GRANT\s+(?:INSERT|ALL)[\s\S]*\b(?:anon|public)\b/i,
  );
  assert.match(rpcMigration, /SECURITY DEFINER/i);
  assert.match(rpcMigration, /SET search_path = public/i);
  assert.match(rpcMigration, /created_at >= now\(\) - interval '30 days'/i);
  assert.match(rpcMigration, /GRANT EXECUTE[\s\S]*TO anon, authenticated/i);
  assert.doesNotMatch(
    rpcMigration,
    /GRANT\s+(?:INSERT|UPDATE|ALL)\s+ON\s+(?:TABLE\s+)?public\.pilot_signups/i,
  );
});

test("every acquisition role has a self-service next step", async () => {
  const pilot = await source("src/lib/pilot.ts");

  assert.match(pilot, /household:[\s\S]*href: "\/help"/);
  assert.match(pilot, /kitchen_operator:[\s\S]*href: "\/kitchen"/);
  assert.match(pilot, /volunteer:[\s\S]*href: "\/volunteer"/);
  assert.match(pilot, /partner:[\s\S]*href: "\/partners"/);
  assert.match(pilot, /sponsor:[\s\S]*href: "\/impact"/);
});

test("God Mode reports acquisition without exposing lead PII", async () => {
  const fn = await source("src/lib/god-mode.functions.ts");
  const route = await source("src/routes/god-mode.tsx");

  assert.match(fn, /acquisition:/);
  assert.match(fn, /uncontacted:/);
  assert.match(fn, /byInterest:/);
  assert.match(fn, /bySource:/);
  assert.doesNotMatch(fn, /pilot_signups"\)\s*\.select\([^)]*(?:email|full_name|note)/);
  assert.match(route, /title="Acquisition"/);
  assert.match(route, /Email-only/);
  assert.match(route, /Opted out/);
});
