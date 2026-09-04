import { supabase } from "@/integrations/supabase/client";

/**
 * Civic aggregates.
 *
 * Every read here is from a publicly readable surface: the impact ledger,
 * approved kitchens, and posted volunteer shifts. No household, sponsor
 * identity or order-level detail reaches this file. Neighborhoods below the
 * minimum cohort size are suppressed rather than shown.
 */

export const MIN_COHORT = 1;

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
  dollars: number;
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
    dollars: number;
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
    claimed: boolean;
    payout_status: string;
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
        "id, name, kind, city, neighborhood, address, latitude, longitude, daily_capacity_meals, cost_per_meal, claimed, payout_status, website, summary",
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

  const kitchens = (kitchensRes.data ?? []).map((k) => ({
    ...k,
    cost_per_meal: Number(k.cost_per_meal),
    latitude: k.latitude === null ? null : Number(k.latitude),
    longitude: k.longitude === null ? null : Number(k.longitude),
  }));
  const events = eventsRes.data ?? [];
  const shifts = shiftsRes.data ?? [];

  const areaOf = (k: { neighborhood: string | null; city: string }) => k.neighborhood || k.city;
  const kitchenArea = new Map(kitchens.map((k) => [k.id, areaOf(k)]));

  const rows = new Map<string, NeighborhoodRow>();
  const row = (area: string) => {
    let r = rows.get(area);
    if (!r) {
      r = {
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
      };
      rows.set(area, r);
    }
    return r;
  };

  for (const k of kitchens) {
    const r = row(areaOf(k));
    r.kitchens += 1;
    r.capacityPerWeek += k.daily_capacity_meals * 7;
  }

  const trendMap = new Map<string, { funded: number; delivered: number }>();
  for (const e of events) {
    const area =
      e.neighborhood || (e.kitchen_id ? kitchenArea.get(e.kitchen_id) : null) || "Unassigned";
    const r = row(area);
    const day = e.occurred_at.slice(0, 10);
    const t = trendMap.get(day) ?? { funded: 0, delivered: 0 };
    if (e.kind === "funded") {
      r.funded += e.meals;
      t.funded += e.meals;
    }
    if (e.kind === "delivered") {
      r.delivered += e.meals;
      t.delivered += e.meals;
    }
    trendMap.set(day, t);
  }

  for (const s of shifts) {
    const area = s.neighborhood || (s.kitchen_id ? kitchenArea.get(s.kitchen_id) : null);
    if (area) row(area).shifts += 1;
  }

  const costByArea = new Map<string, number>();
  for (const k of kitchens) {
    const area = areaOf(k);
    costByArea.set(area, Math.max(costByArea.get(area) ?? 0, k.cost_per_meal));
  }

  const list = [...rows.values()].map((r) => {
    r.awaiting = Math.max(0, r.funded - r.delivered);
    r.unmet = Math.max(0, r.capacityPerWeek - r.funded);
    r.coverage = r.capacityPerWeek > 0 ? Math.min(1, r.funded / r.capacityPerWeek) : 0;
    r.dollars = Math.round(r.funded * (costByArea.get(r.neighborhood) ?? 6.5));
    return r;
  });

  const visible = list.filter((r) => r.kitchens > 0 || r.funded >= MIN_COHORT);
  visible.sort((a, b) => b.unmet - a.unmet || b.funded - a.funded);

  return {
    window: days,
    city: kitchens[0]?.city ?? "Galveston",
    rows: visible,
    suppressed: list.length - visible.length,
    totals: {
      funded: visible.reduce((n, r) => n + r.funded, 0),
      delivered: visible.reduce((n, r) => n + r.delivered, 0),
      awaiting: visible.reduce((n, r) => n + r.awaiting, 0),
      capacityPerWeek: visible.reduce((n, r) => n + r.capacityPerWeek, 0),
      kitchens: kitchens.length,
      unclaimed: kitchens.filter((k) => !k.claimed).length,
      shifts: visible.reduce((n, r) => n + r.shifts, 0),
      dollars: visible.reduce((n, r) => n + r.dollars, 0),
    },
    trend: [...trendMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v })),
    kitchens,
  };
}

export function snapshotToCsv(snap: CivicSnapshot): string {
  const header = [
    "area",
    "kitchens",
    "weekly_capacity_meals",
    "meals_funded",
    "meals_delivered",
    "meals_awaiting_delivery",
    "unmet_capacity_meals",
    "coverage_pct",
    "volunteer_shifts_posted",
    "sponsor_dollars_estimate",
  ].join(",");
  const lines = snap.rows.map((r) =>
    [
      `"${r.neighborhood.replace(/"/g, '""')}"`,
      r.kitchens,
      r.capacityPerWeek,
      r.funded,
      r.delivered,
      r.awaiting,
      r.unmet,
      Math.round(r.coverage * 100),
      r.shifts,
      r.dollars,
    ].join(","),
  );
  return [
    `# ProvisionLoop Civic export — last ${snap.window} days — generated ${new Date().toISOString()}`,
    header,
    ...lines,
  ].join("\n");
}
