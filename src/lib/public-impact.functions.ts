import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

/**
 * Public civic snapshot computed server-side.
 *
 * The browser never needs direct access to environment/test flags or payout
 * identifiers. Sandbox exclusion is derived from the related kitchen record,
 * because impact_events intentionally has no is_test column.
 */
export const getPublicImpactSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [eventsResult, kitchensResult] = await Promise.all([
    supabaseAdmin
      .from("impact_events")
      .select("id, kitchen_id, kind, meals, neighborhood, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(1000),
    supabaseAdmin
      .from("kitchens")
      .select("id, approved, active, claimed, payout_status, payout_account_id, is_test")
      .eq("is_test", false),
  ]);

  if (eventsResult.error) throw new Error("Unable to load public impact events.");
  if (kitchensResult.error) throw new Error("Unable to load public provider totals.");

  const kitchens = kitchensResult.data ?? [];
  const realKitchenIds = new Set(kitchens.map((row) => row.id));
  const events = (eventsResult.data ?? []).filter(
    (event) => Boolean(event.kitchen_id) && realKitchenIds.has(event.kitchen_id!),
  );

  const byNeighborhood = new Map<string, number>();
  let mealsFunded = 0;
  let mealsDelivered = 0;

  for (const event of events) {
    if (event.kind === "funded") {
      mealsFunded += event.meals;
      const neighborhood = event.neighborhood ?? "Unassigned";
      byNeighborhood.set(neighborhood, (byNeighborhood.get(neighborhood) ?? 0) + event.meals);
    }
    if (event.kind === "delivered") mealsDelivered += event.meals;
  }

  const visibleProviders = kitchens.filter((row) => row.approved && row.active);
  const verifiedOperators = visibleProviders.filter((row) => row.claimed);
  const fundingEnabled = verifiedOperators.filter(
    (row) => row.payout_status === "ready" && Boolean(row.payout_account_id),
  );

  return {
    mealsFunded,
    mealsDelivered,
    providersMapped: visibleProviders.length,
    fundingEnabledKitchens: fundingEnabled.length,
    verifiedOperators: verifiedOperators.length,
    neighborhoods: [...byNeighborhood.entries()]
      .map(([neighborhood, meals]) => ({ neighborhood, meals }))
      .sort((a, b) => b.meals - a.meals),
    recent: events.slice(0, 12).map(({ id, kind, meals, neighborhood, occurred_at }) => ({
      id,
      kind,
      meals,
      neighborhood,
      occurred_at,
    })),
  };
});
