import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

const migrationPath = "supabase/migrations/20260909123000_backend_acquisition_worker.sql";
const workerPath = "src/lib/acquisition-worker.server.ts";
const hookRoutePath = "src/routes/api/public/hooks/acquisition-worker.ts";

test("worker enforces contact policy and role CTAs", async () => {
  const worker = await source(workerPath);
  assert.match(worker, /LOVABLE_CRON_SECRET/);
  assert.match(worker, /CRON_SECRET/);
  assert.match(worker, /authenticateCronRequest/);
  assert.match(worker, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(worker, /RESEND_API_KEY/);
  assert.match(worker, /Idempotency-Key/);
  assert.match(worker, /household: "https:\/\/www\.provisionloop\.org\/help"/);
  assert.match(worker, /kitchen_operator: "https:\/\/www\.provisionloop\.org\/kitchen"/);
  assert.match(worker, /volunteer: "https:\/\/www\.provisionloop\.org\/volunteer"/);
  assert.match(worker, /partner: "https:\/\/www\.provisionloop\.org\/partners"/);
  assert.match(worker, /sponsor: "https:\/\/www\.provisionloop\.org\/impact"/);
  assert.match(worker, /No call or meeting is required/);
  assert.match(worker, /acquisition_outreach_dry_run/);

  const hook = await source(hookRoutePath);
  assert.match(hook, /api\/public\/hooks\/acquisition-worker/);
  assert.match(hook, /runAcquisitionWorker/);
});

test("database claim is concurrency-safe and suppresses unsafe followups", async () => {
  const sql = await source(migrationPath);
  assert.match(sql, /do_not_contact = false/);
  assert.match(sql, /followup_count = 0/);
  assert.match(sql, /reply_detected_at IS NULL/);
  assert.match(sql, /business_days_since\(s\.last_contacted_at\) >= 3/);
  assert.match(sql, /FOR UPDATE SKIP LOCKED/);
  assert.match(sql, /outreach_claim_token/);
  assert.match(sql, /UNIQUE \(lead_id, stage\)/);
  assert.match(
    sql,
    /REVOKE ALL ON FUNCTION public\.claim_acquisition_outreach\(integer, uuid\) FROM PUBLIC, anon, authenticated/,
  );
});

test("send state advances only in success RPC and never overwrites internal notes", async () => {
  const sql = await source(migrationPath);
  const success = sql.slice(
    sql.indexOf("record_acquisition_outreach_sent"),
    sql.indexOf("record_acquisition_outreach_failed"),
  );
  const failure = sql.slice(
    sql.indexOf("record_acquisition_outreach_failed"),
    sql.indexOf("acquisition_outreach_dry_run"),
  );
  assert.match(success, /last_contacted_at = now\(\)/);
  assert.match(
    success,
    /followup_count = CASE WHEN _stage = 'followup' THEN 1 ELSE followup_count END/,
  );
  assert.doesNotMatch(failure, /last_contacted_at = now\(\)/);
  assert.doesNotMatch(sql, /internal_note\s*=/);
});
