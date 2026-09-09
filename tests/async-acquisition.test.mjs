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
  assert.match(route, /No sales call/);
  assert.match(route, /No account just to say/);
  assert.match(route, /Raise my hand — no meeting/);
  assert.doesNotMatch(route, /useLegalGate/);
  assert.doesNotMatch(route, /PILOT_LIVE_DATE/);
  assert.doesNotMatch(route, /November 3, 2026/);
});

test("lead intake writes only through a bounded server function", async () => {
  const fn = await source("src/lib/pilot.functions.ts");
  const migration = await source("supabase/migrations/20260908222500_async_acquisition_intake.sql");

  assert.match(fn, /createServerFn/);
  assert.match(fn, /supabaseAdmin/);
  assert.match(fn, /website/);
  assert.match(fn, /30 \* 86_400_000/);
  assert.match(fn, /preferred_contact: "email_only"/);
  assert.match(fn, /user_id: null/);
  assert.match(migration, /ALTER COLUMN user_id DROP NOT NULL/i);
  assert.match(migration, /do_not_contact boolean NOT NULL DEFAULT false/i);
  assert.match(migration, /followup_count integer NOT NULL DEFAULT 0/i);
  assert.doesNotMatch(migration, /GRANT\s+(?:INSERT|ALL)[\s\S]*\b(?:anon|public)\b/i);
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
