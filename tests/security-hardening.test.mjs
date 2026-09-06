import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("payment checkout verifies current legal acceptance server-side", async () => {
  const payments = await source("src/lib/payments.functions.ts");
  const legal = await source("src/lib/legal/server.ts");

  assert.match(payments, /missingServerAcceptances/);
  assert.match(payments, /\.\.\.BASE_DOCS, \.\.\.PAYMENT_DOCS/);
  assert.match(payments, /const legalError = await verifyPaymentLegal\(supabase, userId\)/);
  assert.match(payments, /createMealFundingCheckout[\s\S]*verifyPaymentLegal/);
  assert.match(payments, /createSponsorshipCheckout[\s\S]*verifyPaymentLegal/);
  assert.match(legal, /LEGAL_DOCUMENTS\[key\]\.version/);
  assert.match(legal, /Could not verify required legal acceptance/);
});

test("kitchen payout actions require the current operator agreement", async () => {
  const payments = await source("src/lib/payments.functions.ts");

  assert.match(payments, /verifyKitchenLegal/);
  assert.match(payments, /"kitchen_agreement"/);
  assert.match(payments, /createKitchenPayoutOnboarding[\s\S]*verifyKitchenLegal/);
  assert.match(payments, /refreshKitchenPayoutStatus[\s\S]*verifyKitchenLegal/);
  assert.match(payments, /submitKitchenPayout[\s\S]*verifyKitchenLegal/);
  assert.match(payments, /settleOrderPayout[\s\S]*verifyKitchenLegal/);
});

test("anonymous kitchen access excludes ownership and payout identifiers", async () => {
  const migration = await source(
    "supabase/migrations/20260906160000_public_kitchen_column_privileges.sql",
  );
  const community = await source("src/lib/community.ts");
  const civic = await source("src/lib/civic.ts");

  assert.match(migration, /REVOKE ALL PRIVILEGES ON TABLE public\.kitchens FROM anon/i);
  const grant = migration.match(/GRANT SELECT \(([\s\S]*?)\) ON TABLE public\.kitchens TO anon/i);
  assert.ok(grant, "expected an explicit anonymous column grant");
  assert.doesNotMatch(grant[1], /owner_id/);
  assert.doesNotMatch(grant[1], /payout_account_id/);
  assert.doesNotMatch(grant[1], /claimed_at/);

  assert.doesNotMatch(community, /select\([^)]*payout_account_id/);
  assert.doesNotMatch(civic, /payout_account_id/);
});

test("provider verification is a manual admin decision", async () => {
  const migration = await source(
    "supabase/migrations/20260906055500_manual_kitchen_verification.sql",
  );
  const admin = await source("src/lib/admin.ts");
  const adminRoute = await source("src/routes/admin.tsx");

  assert.match(migration, /INSERT INTO public\.kitchen_claims/i);
  assert.match(migration, /status[^\n]*pending/i);
  assert.match(migration, /review_kitchen_claim/i);
  assert.match(migration, /review_kitchen_registration/i);
  assert.match(admin, /listPendingKitchenClaims/);
  assert.match(admin, /listPendingKitchenRegistrations/);
  assert.match(adminRoute, /Approve claim/);
  assert.match(adminRoute, /Approve provider/);
  assert.match(adminRoute, /Pending verification/);
});
