import { INGREDIENT_BY_ID } from "./ingredients";
import type { PackageSize, PriceProvenance, PriceQuote, Store } from "./types";

/**
 * Price intelligence.
 *
 * Providers register behind one interface. Every quote carries provenance:
 *   VERIFIED_LIVE   — a real retailer feed said so, right now
 *   RECENT_OBSERVED — a receipt or a shopper confirmed this price recently
 *   ESTIMATED       — a seeded/store estimate or national baseline
 *
 * Nothing is ever labelled live unless a live retailer feed supplies it.
 */

export const STORES: Store[] = [
  { id: "heb", name: "H-E-B", banner: "H-E-B", region: "TX" },
  { id: "kroger", name: "Kroger", banner: "Kroger", region: "National" },
  { id: "walmart", name: "Walmart", banner: "Walmart", region: "National" },
  { id: "aldi", name: "ALDI", banner: "ALDI", region: "National" },
  { id: "wholefoods", name: "Whole Foods", banner: "Whole Foods", region: "National" },
];

export const STORE_BY_ID: Record<string, Store> = Object.fromEntries(STORES.map((s) => [s.id, s]));

/** Relative price index per banner — last-resort ESTIMATED quotes only. */
const STORE_INDEX: Record<string, number> = {
  heb: 0.96,
  kroger: 1.0,
  walmart: 0.94,
  aldi: 0.86,
  wholefoods: 1.28,
};

export interface PriceObservation {
  ingredientId: string;
  storeId: string;
  packageLabel: string;
  price: number;
  /** ISO date the observation was made (receipt date, manual confirm or catalog seed date). */
  observedAt: string;
  /** Household observations default to RECENT_OBSERVED; catalog rows can preserve ESTIMATED. */
  provenance?: PriceProvenance;
  /** Catalog rows are public reference data and are never written into a household's own table. */
  scope?: "household" | "catalog";
}

export interface PriceProvider {
  id: string;
  label: string;
  provenance: PriceProvenance;
  quote(
    ingredientId: string,
    storeId: string,
    pkg: PackageSize,
    ctx: { observations: PriceObservation[] },
  ): PriceQuote | null;
}

const OBSERVED_MAX_AGE_DAYS = 45;

export const observedProvider: PriceProvider = {
  id: "observed_or_seeded",
  label: "Observed or seeded store price",
  provenance: "RECENT_OBSERVED",
  quote(ingredientId, storeId, pkg, ctx) {
    const cutoff = Date.now() - OBSERVED_MAX_AGE_DAYS * 86_400_000;
    const hit = ctx.observations
      .filter(
        (o) =>
          o.ingredientId === ingredientId &&
          o.storeId === storeId &&
          o.packageLabel === pkg.label &&
          Date.parse(o.observedAt) >= cutoff,
      )
      .sort((a, b) => {
        const householdPriority = Number(b.scope !== "catalog") - Number(a.scope !== "catalog");
        if (householdPriority !== 0) return householdPriority;
        return Date.parse(b.observedAt) - Date.parse(a.observedAt);
      })[0];
    if (!hit) return null;

    const provenance = hit.provenance ?? "RECENT_OBSERVED";
    return {
      ingredientId,
      storeId,
      pkg,
      price: hit.price,
      provenance,
      observedAt: hit.observedAt,
      providerId: hit.scope === "catalog" ? "seeded_store_catalog" : "household_observed",
    };
  },
};

export const estimatedProvider: PriceProvider = {
  id: "national_baseline",
  label: "National baseline estimate",
  provenance: "ESTIMATED",
  quote(ingredientId, storeId, pkg) {
    const index = STORE_INDEX[storeId] ?? 1;
    return {
      ingredientId,
      storeId,
      pkg,
      price: Math.round(pkg.baselinePrice * index * 100) / 100,
      provenance: "ESTIMATED",
      providerId: this.id,
    };
  },
};

/** Providers are consulted in order; the first hit wins. */
export const PROVIDERS: PriceProvider[] = [observedProvider, estimatedProvider];

export function quotePackage(
  ingredientId: string,
  storeId: string,
  pkg: PackageSize,
  observations: PriceObservation[] = [],
): PriceQuote {
  for (const provider of PROVIDERS) {
    const q = provider.quote(ingredientId, storeId, pkg, { observations });
    if (q) return q;
  }
  return estimatedProvider.quote(ingredientId, storeId, pkg, { observations })!;
}

/** Cheapest unit-cost package for an ingredient at a store. */
export function bestPackage(
  ingredientId: string,
  storeId: string,
  observations: PriceObservation[] = [],
): PriceQuote | null {
  const ing = INGREDIENT_BY_ID[ingredientId];
  if (!ing || ing.packages.length === 0) return null;
  const quotes = ing.packages.map((p) => quotePackage(ingredientId, storeId, p, observations));
  return quotes.sort((a, b) => a.price / a.pkg.size - b.price / b.pkg.size)[0]!;
}

export const PROVENANCE_LABEL: Record<PriceProvenance, string> = {
  VERIFIED_LIVE: "VERIFIED LIVE",
  RECENT_OBSERVED: "RECENT OBSERVED",
  ESTIMATED: "ESTIMATED",
};
