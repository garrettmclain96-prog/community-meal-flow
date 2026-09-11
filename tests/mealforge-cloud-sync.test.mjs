import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

const migrationPath = "supabase/migrations/20260911102000_mealforge_atomic_snapshot_sync.sql";
const cloudPath = "src/lib/food/cloud.ts";

test("MealForge snapshot RPC preserves the existing RLS ownership boundary", async () => {
  const sql = await source(migrationPath);
  assert.match(sql, /sync_mealforge_snapshot/);
  assert.match(sql, /SECURITY INVOKER/);
  assert.match(sql, /public\.owns_household\(_household_id\)/);
  assert.match(
    sql,
    /REVOKE ALL ON FUNCTION public\.sync_mealforge_snapshot\(uuid, jsonb\) FROM PUBLIC, anon/,
  );
  assert.match(
    sql,
    /GRANT EXECUTE ON FUNCTION public\.sync_mealforge_snapshot\(uuid, jsonb\) TO authenticated/,
  );
});

test("MealForge cloud writes use one atomic RPC instead of client-side delete/reinsert chains", async () => {
  const cloud = await source(cloudPath);
  const pushStart = cloud.indexOf("export function pushCloudState");
  assert.notEqual(pushStart, -1);
  const push = cloud.slice(pushStart);

  assert.match(push, /sync_mealforge_snapshot/);
  assert.match(push, /syncQueue = syncQueue/);
  assert.match(push, /state\.observations\.filter\(\(o\) => o\.scope !== "catalog"\)/);
  assert.doesNotMatch(push, /from\("household_members"\)\.delete/);
  assert.doesNotMatch(push, /from\("pantry_items"\)\.delete/);
  assert.doesNotMatch(push, /from\("recipes"\)\.delete/);
  assert.doesNotMatch(push, /from\("price_observations"\)\.delete/);
  assert.doesNotMatch(push, /from\("meal_plans"\)\.delete/);
});

test("atomic RPC rewrites all household-owned collections in one database transaction", async () => {
  const sql = await source(migrationPath);
  for (const table of [
    "household_members",
    "pantry_items",
    "recipes",
    "price_observations",
    "meal_plans",
  ]) {
    assert.match(sql, new RegExp(`DELETE FROM public\\.${table}`));
  }
  assert.match(sql, /UPDATE public\.households/);
});
