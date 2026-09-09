import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

async function outreachMigration() {
  const dir = new URL("../supabase/migrations/", import.meta.url);
  const files = await readdir(dir);
  for (const file of files.sort()) {
    const sql = await readFile(new URL(file, dir), "utf8");
    if (sql.includes("acquisition_outreach_queue")) return sql;
  }
  throw new Error("outreach migration not found");
}

test("outreach queue is admin-gated and minimal", async () => {
  const sql = await outreachMigration();

  assert.match(sql, /assert_acquisition_admin/);
  assert.match(sql, /platform_admin/);
  assert.match(sql, /SET search_path = public/);
  assert.match(sql, /do_not_contact = false/);
  assert.match(sql, /last_contacted_at IS NULL/);
  assert.match(sql, /business_days_since\(s\.last_contacted_at\) >= 3/);
  assert.match(
    sql,
    /REVOKE ALL ON FUNCTION public\.acquisition_outreach_queue\(integer\) FROM PUBLIC, anon/,
  );
  // Never returns notes, postal code, organization or metadata.
  assert.doesNotMatch(sql, /s\.note|s\.internal_note|s\.metadata|s\.postal_code/);
});

test("mutations require an exact id and preserve internal state", async () => {
  const sql = await outreachMigration();

  assert.match(sql, /mark_acquisition_initial_sent\(_signup_id uuid\)/);
  assert.match(sql, /mark_acquisition_followup_sent\(_signup_id uuid\)/);
  assert.doesNotMatch(sql, /SET[\s\S]*internal_note\s*=/);
  assert.match(sql, /status = CASE WHEN status = 'queued_manual_review' THEN 'in_progress'/);
  assert.match(sql, /SET\s+followup_count = 1/);
});

test("server functions authorize before calling the RPCs", async () => {
  const fn = await source("src/lib/acquisition.functions.ts");

  assert.match(fn, /requireSupabaseAuth/);
  assert.match(fn, /_role: "platform_admin"/);
  assert.doesNotMatch(fn, /supabaseAdmin|SERVICE_ROLE/);
  assert.match(fn, /data\.sent !== true/);
});
