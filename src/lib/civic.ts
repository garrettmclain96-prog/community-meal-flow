import { supabase } from "@/integrations/supabase/client";

/**
 * Public civic aggregates.
 *
 * Kitchen directory/capacity data is public operator information. Impact data
 * is aggregated and small neighborhood counts are suppressed. Test kitchens
 * and their events are never mixed into real-world civic totals.
 */

export const MIN_COHORT = 5;

export type WindowDays = 7 | 30 | 90;

export interface NeighborhoodRow {
  neighborhood: string;
  funded: number;
  delivered: number;
  awaiting: number;
  capacityPerWeek: number;
  kitchens: number;
  unmet: number;
  coverage: number;
  shifts: number;
  /** Estimated dollars, never represented as settled payment volume. */
  dollars: number;
  impactSuppressed: boolean;
}

export interface CivicSnapshot {
  window: WindowDays;
  city: string;
  rows: NeighborhoodRow[];
  totals: {
    funded: number;
    delivered: number;
    awaiting: number;
    capacityPerWeek: number;
    kitchens: number;
    unclaimed: number;
    shifts: number;
    /** Estimate based on funded meals and posted kitchen prices. */
    dollars: number;
  };
  test: {
    kitchens: number;
    capacityPerWeek: number;
    events: number;
  };
  trend: Array<{ date: string; funded: number; delivered: number }>;
  kitchens: Array<{
    id: string;
    name: string;
    kind: string;
    city: string;
    neighborhood: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    daily_capacity_meals: number;
    cost_per_meal: number;
    is_test: boolean;
    claimed: boolean;
    payout_status: string;
    payout_account_id: string | null;
    website: string | null;
    summary: string | null;
  }>;
  suppressed: number;
}

export async function loadCivicSnapshot(days: WindowDays): Promise<CivicSnapshot> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [eventsRes, kitchensRes, shiftsRes] = await Promise.all([
    supabase
      .from("impact_events")
      .select("kind, meals, neighborhood, occurred_at, kitchen_id")
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: true })
      .limit(5000),
    supabase
      .from("kitchens")
      .select(
        "id, name, kind, city, neighborhood, address, latitude, longitude, daily_capacity_meals, cost_per_meal, claimed, payout_status, payout_account_id, website, summary, is_test",
      )
      .eq("approved", true)
      .eq("active", true)
      .order("name"),
    supabase
      .from("volunteer_shifts")
      .select("id, kitchen_id, neighborhood, starts_at")
      .gte("starts_at", since),
  ]);

  if (eventsRes.error) throw eventsRes.error;
  if (kitchensRes.error) throw kitchensRes.error;
  if (shiftsRes.error) throw shiftsRes.error;

  const kitchens = (kitchensRes.data ?? []).map((k) => ({
    ...k,
    cost_per_meal: Number(k.cost_per_meal),
    latitude: k.latitude === null ? null : Number(k.latitude),
    longitude: k.longitude === null ? null : Number(k.longitude),
  }));
  const realKitchens = kitchens.filter((k) => !k.is_test);
  const testKitchens = kitchens.filter((k) => k.is_test);
  const kitchenById = new Map(kitchens.map((k) => [k.id, k]));
  const kitchenArea = new Map(
    realKitchens.map((k) => [k.id, k.neighborhood || k.city] as const),
  );

  const allEvents = eventsRes.data ?? [];
  const testEvents = allEvents.filter((event) => {
    const kitchen = event.kitchen_id ? kitchenById.get(event.kitchen_id) : null;
    return kitchen?.is_test === true;
  });
  const events = allEvents.filter((event) => {
    const kitchen = event.kitchen_id ? kitchenById.get(event.kitchen_id) : null;
    return kitchen?.is_test !== true;
  });
  const shifts = (shiftsRes.data ?? []).filter((shift) => {
    const kitchen = shift.kitchen_id ? kitchenById.get(shift.kitchen_id) : null;
    return kitchen?.is_test !== true;
  });

  const areaOf = (k: { neighborhood: string | null; city: string }) => k.neighborhood || k.city;
  const rows = new Map<string, NeighborhoodRow>();
  const row = (area: string) => {
    let current = rows.get(area);
    if (!current) {
      current = {
        neighborhood: area,
        funded: 0,
        delivered: 0,
        awaiting: 0,
        capacityPerWeek: 0,
        kitchens: 0,
        unmet: 0,
        coverage: 0,
        shifts: 0,
        dollars: 0,
        impactSuppressed: false,
      };
      rows.set(area, current);
    }
    return current;
  };

  for (const kitchen of realKitchens) {
    const current = row(areaOf(kitchen));
    current.kitchens += 1;
    current.capacityPerWeek += kitchen.daily_capacity_meals * 7;
  }

  const trendMap = new Map<string, { funded: number; delivered: number }>();
  for (const event of events) {
    const area =
      event.neighborhood ||
      (event.kitchen_id ? kitchenArea.get(event.kitchen_id) : null) ||
      "Unassigned";
    const current = row(area);
    const day = event.occurred_at.slice(0, 10);
    const trend = trendMap.get(day) ?? { funded: 0, delivered: 0 };
    if (event.kind === "funded") {
      current.funded += event.meals;
      trend.funded += event.meals;
    }
    if (event.kind === "delivered") {
      current.delivered += event.meals;
      trend.delivered += event.meals;
    }
    trendMap.set(day, trend);
  }

  for (const shift of shifts) {
    const area = shift.neighborhood || (shift.kitchen_id ? kitchenArea.get(shift.kitchen_id) : null);
    if (area) row(area).shifts += 1;
  }

  const costByArea = new Map<string, number>();
  for (const kitchen of realKitchens) {
    const area = areaOf(kitchen);
    costByArea.set(area, Math.max(costByArea.get(area) ?? 0, kitchen.cost_per_meal));
  }

  const list = [...rows.values()].map((current) => {
    const activity = Math.max(current.funded, current.delivered);
    current.impactSuppressed = activity > 0 && activity < MIN_COHORT;
    current.awaiting = Math.max(0, current.funded - current.delivered);
    current.unmet = Math.max(0, current.capacityPerWeek - current.funded);
    current.coverage = current.capacityPerWeek > 0 ? Math.min(1, current.funded / current.capacityPerWeek) : 0;
    current.dollars = Math.round(current.funded * (costByArea.get(current.neighborhood) ?? 6.5));

    if (current.impactSuppressed) {
      current.funded = 0;
      current.delivered = 0;
      current.awaiting = 0;
      current.coverage = 0;
      current.dollars = 0;
    }
    return current;
  });

  list.sort((a, b) => b.unmet - a.unmet || b.funded - a.funded);

  const visibleTrend = [...trendMap.entries()]
    .map(([date, value]) => ({ date, ...value }))
    .filter((value) => Math.max(value.funded, value.delivered) >= MIN_COHORT)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    window: days,
    city: realKitchens[0]?.city ?? kitchens[0]?.city ?? "Galveston",
    rows: list,
    suppressed: list.filter((current) => current.impactSuppressed).length,
    totals: {
      funded: list.reduce((n, current) => n + current.funded, 0),
      delivered: list.reduce((n, current) => n + current.delivered, 0),
      awaiting: list.reduce((n, current) => n + current.awaiting, 0),
      capacityPerWeek: list.reduce((n, current) => n + current.capacityPerWeek, 0),
      kitchens: realKitchens.length,
      unclaimed: realKitchens.filter((kitchen) => !kitchen.claimed).length,
      shifts: list.reduce((n, current) => n + current.shifts, 0),
      dollars: list.reduce((n, current) => n + current.dollars, 0),
    },
    test: {
      kitchens: testKitchens.length,
      capacityPerWeek: testKitchens.reduce(
        (sum, kitchen) => sum + kitchen.daily_capacity_meals * 7,
        0,
      ),
      events: testEvents.length,
    },
    trend: visibleTrend,
    kitchens,
  };
}

export function snapshotToCsv(snapshot: CivicSnapshot): string {
  const header = [
    "area",
    "kitchens",
    "weekly_capacity_meals",
    "impact_suppressed",
    "meals_funded",
    "meals_delivered",
    "meals_awaiting_delivery",
    "unmet_capacity_meals",
    "coverage_pct",
    "volunteer_shifts_posted",
    "sponsor_dollars_estimate",
  ].join(",");
  const lines = snapshot.rows.map((current) =>
    [
      `"${current.neighborhood.replace(/"/g, '""')}"`,
      current.kitchens,
      current.capacityPerWeek,
      current.impactSuppressed ? "true" : "false",
      current.impactSuppressed ? "SUPPRESSED" : current.funded,
      current.impactSuppressed ? "SUPPRESSED" : current.delivered,
      current.impactSuppressed ? "SUPPRESSED" : current.awaiting,
      current.unmet,
      current.impactSuppressed ? "SUPPRESSED" : Math.round(current.coverage * 100),
      current.shifts,
      current.impactSuppressed ? "SUPPRESSED" : current.dollars,
    ].join(","),
  );
  return [
    `# ProvisionLoop Civic export — real-world only — last ${snapshot.window} days — generated ${new Date().toISOString()}`,
    `# Test/sandbox excluded: ${snapshot.test.kitchens} kitchens, ${snapshot.test.events} events`,
    `# Impact values below ${MIN_COHORT} meals per area are suppressed`,
    header,
    ...lines,
  ].join("\n");
}
