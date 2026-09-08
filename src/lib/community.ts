import { supabase } from "@/integrations/supabase/client";
import { getPublicImpactSnapshot } from "@/lib/public-impact.functions";

/**
 * Live community-side reads.
 *
 * Impact totals are aggregated server-side so sandbox/test rows can be removed
 * before anything public is returned. Public kitchen reads remain deliberately
 * column-scoped and exclude test providers from the public network.
 */

export type ProviderState = "directory" | "verified" | "funding_enabled";

export const PROVIDER_STATE_LABEL: Record<ProviderState, string> = {
  directory: "Directory listing — not affiliated",
  verified: "Operator verified",
  funding_enabled: "Funding enabled",
};

export interface KitchenRow {
  id: string;
  name: string;
  kind: string;
  city: string;
  neighborhood: string | null;
  daily_capacity_meals: number;
  cost_per_meal: number;
  address: string | null;
  website: string | null;
  summary: string | null;
  is_test: boolean;
  claimed: boolean;
  payout_status: string;
  /** Honest network state, derived server-data-side. Never inferred from copy. */
  providerState: ProviderState;
}

/** A provider can only receive money once an operator claimed it AND payouts are live. */
export function isFundable(k: { claimed: boolean; payout_status: string }): boolean {
  // The database enforces that `ready` cannot exist without payout_account_id.
  return k.claimed === true && k.payout_status === "ready";
}

function withState<T extends { claimed: boolean; payout_status: string; cost_per_meal: unknown }>(
  k: T,
): T & { cost_per_meal: number; providerState: ProviderState } {
  return {
    ...k,
    cost_per_meal: Number(k.cost_per_meal),
    providerState: isFundable(k) ? "funding_enabled" : k.claimed ? "verified" : "directory",
  };
}

const KITCHEN_COLUMNS =
  "id, name, kind, city, neighborhood, daily_capacity_meals, cost_per_meal, address, website, summary, claimed, payout_status, is_test";

/** Full public directory — discovery only. Includes unaffiliated directory listings, never test fixtures. */
export async function listKitchens(): Promise<KitchenRow[]> {
  const { data, error } = await supabase
    .from("kitchens")
    .select(KITCHEN_COLUMNS)
    .eq("approved", true)
    .eq("active", true)
    .eq("is_test", false)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(withState);
}

/**
 * Providers that may actually receive funding. UI must use this for any
 * funding decision; the server re-checks the same conditions on checkout.
 * Test fixtures are intentionally excluded from the public funding surface.
 */
export async function listFundableKitchens(): Promise<KitchenRow[]> {
  const { data, error } = await supabase
    .from("kitchens")
    .select(KITCHEN_COLUMNS)
    .eq("approved", true)
    .eq("active", true)
    .eq("claimed", true)
    .eq("payout_status", "ready")
    .eq("is_test", false)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(withState);
}

export interface TemplateRow {
  id: string;
  kitchen_id: string;
  name: string;
  description: string | null;
  servings_per_batch: number;
  cost_per_meal: number;
  dietary_tags: string[];
  active: boolean;
}

export async function listTemplates(kitchenId?: string): Promise<TemplateRow[]> {
  let q = supabase.from("meal_templates").select("*").eq("active", true);
  if (kitchenId) q = q.eq("kitchen_id", kitchenId);
  const { data, error } = await q.order("name");
  if (error) throw error;
  return (data ?? []).map((t) => ({ ...t, cost_per_meal: Number(t.cost_per_meal) }));
}

export interface ImpactTotals {
  mealsFunded: number;
  mealsDelivered: number;
  /** Every approved, active, non-test provider visible in the public directory. */
  providersMapped: number;
  /** Non-test providers an operator claimed and that can actually receive funding. */
  fundingEnabledKitchens: number;
  /** Non-test providers an operator claimed, regardless of payout readiness. */
  verifiedOperators: number;
  neighborhoods: Array<{ neighborhood: string; meals: number }>;
  recent: Array<{
    id: string;
    kind: string;
    meals: number;
    neighborhood: string | null;
    occurred_at: string;
  }>;
}

/** Public totals are sanitized and filtered server-side before reaching the browser. */
export async function loadImpactTotals(): Promise<ImpactTotals> {
  return await getPublicImpactSnapshot();
}

// Funding now happens exclusively through paid checkout
// (see src/lib/payments.functions.ts). The old unpaid RPC path is revoked.

export async function advanceOrder(orderId: string, status: "accepted" | "prepared" | "delivered") {
  const { error } = await supabase.rpc("advance_order", { _order_id: orderId, _status: status });
  if (error) throw error;
}
