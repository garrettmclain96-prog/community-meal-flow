import { supabase } from "@/integrations/supabase/client";

/**
 * Public civic aggregates.
 *
 * Raw impact events are not browser-readable. The database returns one
 * sanitized aggregate snapshot with test data separated and small cohorts
 * suppressed before anything reaches the public client.
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
    website: string | null;
    summary: string | null;
  }>;
  suppressed: number;
}

export async function loadCivicSnapshot(days: WindowDays): Promise<CivicSnapshot> {
  const { data, error } = await supabase.rpc(
    "get_public_civic_snapshot" as never,
    { _days: days } as never,
  );

  if (error) throw error;
  if (!data || typeof data !== "object") {
    throw new Error("Civic snapshot was unavailable.");
  }

  return data as unknown as CivicSnapshot;
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
