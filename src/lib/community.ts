import { supabase } from "@/integrations/supabase/client";

/**
 * Live community-side reads.
 *
 * Impact events and approved kitchens are the only publicly readable surface;
 * household data never leaves the household's own rows.
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
  claimed: boolean;
  payout_status: string;
  /** Honest network state, derived server-data-side. Never inferred from copy. */
  providerState: ProviderState;
}

/** A provider can only receive money once an operator claimed it AND payouts are live. */
export function isFundable(k: { claimed: boolean; payout_status: string }): boolean {
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
  "id, name, kind, city, neighborhood, daily_capacity_meals, cost_per_meal, address, website, summary, claimed, payout_status";

/** Full public directory — discovery only. Includes unaffiliated directory listings. */
export async function listKitchens(): Promise<KitchenRow[]> {
  const { data, error } = await supabase
    .from("kitchens")
    .select(KITCHEN_COLUMNS)
    .eq("approved", true)
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map(withState);
}

/**
 * Providers that may actually receive funding. UI must use this for any
 * funding decision; the server re-checks the same conditions on checkout.
 */
export async function listFundableKitchens(): Promise<KitchenRow[]> {
  const { data, error } = await supabase
    .from("kitchens")
    .select(KITCHEN_COLUMNS)
    .eq("approved", true)
    .eq("active", true)
    .eq("claimed", true)
    .eq("payout_status", "ready")
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
  kitchens: number;
  neighborhoods: Array<{ neighborhood: string; meals: number }>;
  recent: Array<{
    id: string;
    kind: string;
    meals: number;
    neighborhood: string | null;
    occurred_at: string;
  }>;
}

export async function loadImpactTotals(): Promise<ImpactTotals> {
  const [events, kitchens] = await Promise.all([
    supabase
      .from("impact_events")
      .select("id, kind, meals, neighborhood, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(1000),
    supabase.from("kitchens").select("id", { count: "exact", head: true }).eq("approved", true),
  ]);
  if (events.error) throw events.error;

  const rows = events.data ?? [];
  const byHood = new Map<string, number>();
  let funded = 0;
  let delivered = 0;
  for (const e of rows) {
    if (e.kind === "funded") {
      funded += e.meals;
      const hood = e.neighborhood ?? "Unassigned";
      byHood.set(hood, (byHood.get(hood) ?? 0) + e.meals);
    }
    if (e.kind === "delivered") delivered += e.meals;
  }

  return {
    mealsFunded: funded,
    mealsDelivered: delivered,
    kitchens: kitchens.count ?? 0,
    neighborhoods: [...byHood.entries()]
      .map(([neighborhood, meals]) => ({ neighborhood, meals }))
      .sort((a, b) => b.meals - a.meals),
    recent: rows.slice(0, 12),
  };
}

// Funding now happens exclusively through paid checkout
// (see src/lib/payments.functions.ts). The old unpaid RPC path is revoked.

export async function advanceOrder(orderId: string, status: "accepted" | "prepared" | "delivered") {
  const { error } = await supabase.rpc("advance_order", { _order_id: orderId, _status: status });
  if (error) throw error;
}
