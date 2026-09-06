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

test("partner PII and volunteer delivery RPCs require current governed agreements", async () => {
  const migration = await source(
    "supabase/migrations/20260906163000_enforce_governed_legal_acceptance.sql",
  );

  assert.match(migration, /require_legal_acceptance\('partner_data', '1\.0'\)/);
  assert.match(migration, /get_my_partner_workspace[\s\S]*partner_data/);
  assert.match(migration, /update_partner_referral[\s\S]*partner_data/);
  assert.match(migration, /claim_delivery_run[\s\S]*volunteer_waiver/);
  assert.match(migration, /advance_delivery_run[\s\S]*volunteer_waiver/);
  assert.match(migration, /auth\.uid\(\)/);
});

test("unverified kitchens cannot publish operational resources and approval completes claimed state", async () => {
  const migration = await source(
    "supabase/migrations/20260906165000_gate_unverified_kitchen_operations.sql",
  );

  assert.match(migration, /operates_approved_kitchen/);
  assert.match(migration, /k\.approved = true/);
  assert.match(migration, /k\.active = true/);
  assert.match(migration, /k\.claimed = true/);
  assert.match(migration, /claimed = true/);
  assert.match(migration, /approved kitchen owners manage templates/);
  assert.match(migration, /approved active templates are public/);
  assert.match(migration, /approved kitchen owners manage shifts/);
  assert.match(migration, /approved kitchen shifts are public/);
});
