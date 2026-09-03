import { INGREDIENT_BY_ID } from "./ingredients";
import { bestPackage, type PriceObservation } from "./pricing";
import { normalizeToPackageUnit, packageUnit, type MealPlan } from "./planner";
import type { PantryItem, PriceProvenance } from "./types";

/**
 * Consolidated grocery list with package-size intelligence.
 *
 * Recipe quantity is never the same thing as purchasable quantity. We add up
 * everything the week needs, subtract the pantry, round up to real packages,
 * and hand the leftover back to the pantry as a tracked remainder.
 */

export interface GroceryLine {
  ingredientId: string;
  name: string;
  aisle: string;
  neededBase: number;
  fromPantryBase: number;
  packages: number;
  packageLabel: string;
  packageSize: number;
  unit: string;
  unitPrice: number;
  cost: number;
  provenance: PriceProvenance;
  remainderBase: number;
  usedIn: string[];
}

export interface GroceryList {
  storeId: string;
  lines: GroceryLine[];
  byAisle: Array<{ aisle: string; lines: GroceryLine[]; subtotal: number }>;
  total: number;
  pantrySavings: number;
  remainderValue: number;
  generatedAt: string;
}

export function buildGroceryList(
  plan: MealPlan,
  pantry: PantryItem[],
  observations: PriceObservation[] = [],
): GroceryList {
  const needed = new Map<string, { base: number; usedIn: Set<string> }>();

  for (const meal of plan.meals) {
    for (const line of meal.cost.lines) {
      const entry = needed.get(line.ingredientId) ?? { base: 0, usedIn: new Set<string>() };
      entry.base += line.neededBase;
      entry.usedIn.add(meal.recipe.title);
      needed.set(line.ingredientId, entry);
    }
  }

  const lines: GroceryLine[] = [];
  let pantrySavings = 0;

  for (const [ingredientId, entry] of needed) {
    const ing = INGREDIENT_BY_ID[ingredientId];
    const quote = bestPackage(ingredientId, plan.storeId, observations);
    if (!ing || !quote) continue;

    const available = pantry
      .filter((p) => p.ingredientId === ingredientId)
      .reduce(
        (s, p) =>
          s + (normalizeToPackageUnit(p.quantity.amount, p.quantity.unit, ingredientId) ?? 0),
        0,
      );
    const fromPantry = Math.min(available, entry.base);
    const toBuy = Math.max(0, entry.base - fromPantry);
    const packages = toBuy > 0 ? Math.ceil(toBuy / quote.pkg.size) : 0;
    const cost = Math.round(packages * quote.price * 100) / 100;
    const remainder = packages > 0 ? packages * quote.pkg.size - toBuy : 0;

    pantrySavings += (fromPantry / quote.pkg.size) * quote.price;

    if (packages === 0) continue;

    lines.push({
      ingredientId,
      name: ing.name,
      aisle: ing.aisle,
      neededBase: entry.base,
      fromPantryBase: fromPantry,
      packages,
      packageLabel: quote.pkg.label,
      packageSize: quote.pkg.size,
      unit: packageUnit(ingredientId),
      unitPrice: quote.price,
      cost,
      provenance: quote.provenance,
      remainderBase: remainder,
      usedIn: [...entry.usedIn],
    });
  }

  lines.sort((a, b) => a.aisle.localeCompare(b.aisle) || a.name.localeCompare(b.name));

  const aisles = new Map<string, GroceryLine[]>();
  for (const line of lines) {
    const arr = aisles.get(line.aisle) ?? [];
    arr.push(line);
    aisles.set(line.aisle, arr);
  }

  const total = Math.round(lines.reduce((s, l) => s + l.cost, 0) * 100) / 100;
  const remainderValue =
    Math.round(
      lines.reduce((s, l) => s + (l.remainderBase / l.packageSize) * l.unitPrice, 0) * 100,
    ) / 100;

  return {
    storeId: plan.storeId,
    lines,
    byAisle: [...aisles.entries()].map(([aisle, ls]) => ({
      aisle,
      lines: ls,
      subtotal: Math.round(ls.reduce((s, l) => s + l.cost, 0) * 100) / 100,
    })),
    total,
    pantrySavings: Math.round(pantrySavings * 100) / 100,
    remainderValue,
    generatedAt: new Date().toISOString(),
  };
}

/** Leftovers from package rounding, ready to write back into the pantry. */
export function remaindersToPantry(list: GroceryList): PantryItem[] {
  return list.lines
    .filter((l) => l.remainderBase > 0.001)
    .map((l) => ({
      id: `rem_${l.ingredientId}_${Date.now().toString(36)}`,
      ingredientId: l.ingredientId,
      quantity: { amount: Math.round(l.remainderBase * 100) / 100, unit: l.unit },
      origin: "package_remainder" as const,
      addedAt: new Date().toISOString(),
    }));
}
