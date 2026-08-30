import { INGREDIENT_BY_ID } from "./ingredients";
import { bestPackage, type PriceObservation } from "./pricing";
import type { Household, PantryItem, Recipe } from "./types";
import { convert } from "./units";

/**
 * Deterministic meal planner.
 *
 * Constraint filtering + scoring pick the week. No model invents the plan;
 * AI is only ever used upstream for normalization and downstream for
 * explanation.
 */

export interface RecipeCost {
  recipeId: string;
  /** total cost of everything the household must buy, after pantry offset */
  purchaseCost: number;
  /** full ingredient cost ignoring pantry, used for per-serving comparison */
  grossCost: number;
  costPerServing: number;
  lines: CostLine[];
}

export interface CostLine {
  ingredientId: string;
  neededBase: number;
  fromPantryBase: number;
  packagesToBuy: number;
  packageLabel: string;
  cost: number;
  provenance: string;
  remainderBase: number;
}

/** All pantry stock for an ingredient, in the ingredient's base dimension. */
function pantryBase(pantry: PantryItem[], ingredientId: string): number {
  const ing = INGREDIENT_BY_ID[ingredientId];
  if (!ing) return 0;
  let total = 0;
  for (const item of pantry) {
    if (item.ingredientId !== ingredientId) continue;
    const amt = normalizeToPackageUnit(item.quantity.amount, item.quantity.unit, ingredientId);
    if (amt !== null) total += amt;
  }
  return total;
}

/** Converts any quantity into the unit of the ingredient's first package. */
export function normalizeToPackageUnit(
  amount: number,
  unit: string,
  ingredientId: string,
): number | null {
  const ing = INGREDIENT_BY_ID[ingredientId];
  const pkg = ing?.packages[0];
  if (!ing || !pkg) return null;
  const direct = convert({ amount, unit }, pkg.unit, ing.gramsPerCup);
  if (direct !== null) return direct;
  // count <-> mass via gramsEach
  if (ing.gramsEach) {
    const asGrams = convert({ amount, unit }, "g", ing.gramsPerCup);
    if (unit === "each" || unit === "clove" || unit === "slice") {
      return convert({ amount: amount * ing.gramsEach, unit: "g" }, pkg.unit, ing.gramsPerCup);
    }
    if (asGrams !== null && pkg.unit === "each") return asGrams / ing.gramsEach;
  }
  return null;
}

export interface CostContext {
  storeId: string;
  observations: PriceObservation[];
  pantry: PantryItem[];
  /** servings the household actually needs for one dinner */
  targetServings: number;
}

export function costRecipe(recipe: Recipe, ctx: CostContext): RecipeCost {
  const scale = ctx.targetServings / recipe.servings;
  const lines: CostLine[] = [];
  let purchaseCost = 0;
  let grossCost = 0;

  for (const item of recipe.ingredients) {
    const ing = INGREDIENT_BY_ID[item.ingredientId];
    if (!ing) continue;
    const needed = normalizeToPackageUnit(
      item.quantity.amount * scale,
      item.quantity.unit,
      item.ingredientId,
    );
    const quote = bestPackage(item.ingredientId, ctx.storeId, ctx.observations);
    if (needed === null || !quote) continue;

    const available = pantryBase(ctx.pantry, item.ingredientId);
    const fromPantry = Math.min(available, needed);
    const toBuyAmount = Math.max(0, needed - fromPantry);
    const packages = toBuyAmount > 0 ? Math.ceil(toBuyAmount / quote.pkg.size) : 0;
    const cost = Math.round(packages * quote.price * 100) / 100;
    const remainder = packages * quote.pkg.size - toBuyAmount;

    purchaseCost += cost;
    grossCost += (needed / quote.pkg.size) * quote.price;

    lines.push({
      ingredientId: item.ingredientId,
      neededBase: needed,
      fromPantryBase: fromPantry,
      packagesToBuy: packages,
      packageLabel: quote.pkg.label,
      cost,
      provenance: quote.provenance,
      remainderBase: remainder,
    });
  }

  return {
    recipeId: recipe.id,
    purchaseCost: Math.round(purchaseCost * 100) / 100,
    grossCost: Math.round(grossCost * 100) / 100,
    costPerServing: Math.round((grossCost / Math.max(1, ctx.targetServings)) * 100) / 100,
    lines,
  };
}

export function householdServings(household: Household): number {
  if (household.members.length === 0) return 2;
  return Math.max(
    1,
    Math.round(household.members.reduce((s, m) => s + m.appetite, 0)),
  );
}

export interface Exclusion {
  recipeId: string;
  reason: string;
}

export function isRecipeAllowed(recipe: Recipe, household: Household): string | null {
  for (const item of recipe.ingredients) {
    if (item.optional) continue;
    const ing = INGREDIENT_BY_ID[item.ingredientId];
    if (!ing) continue;
    const allergen = ing.allergens.find((a) => household.allergies.includes(a));
    if (allergen) return `contains ${allergen.replace("_", " ")}`;
    const avoided = ing.diet.find((d) => household.avoidTags.includes(d));
    if (avoided) return `contains ${avoided}`;
  }
  if (recipe.totalTimeMinutes > household.maxCookMinutes) {
    return `takes ${recipe.totalTimeMinutes} min`;
  }
  if (household.equipment.length > 0) {
    const missing = recipe.equipment.find(
      (e) => !household.equipment.some((h) => h.toLowerCase() === e.toLowerCase()),
    );
    if (missing) return `needs ${missing}`;
  }
  return null;
}

export interface PlannedMeal {
  recipe: Recipe;
  cost: RecipeCost;
  score: number;
  reasons: string[];
}

export interface MealPlan {
  meals: PlannedMeal[];
  totalCost: number;
  budget: number;
  targetServings: number;
  storeId: string;
  excluded: Exclusion[];
  /** budget shortfall, in USD — the community assistance bridge reads this */
  gap: number;
  generatedAt: string;
}

interface ScoreInput {
  recipe: Recipe;
  cost: RecipeCost;
  household: Household;
  chosen: PlannedMeal[];
  history: string[];
}

function scoreCandidate({ recipe, cost, household, chosen, history }: ScoreInput): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 100;

  // cost efficiency, relative to a $3.25/serving reference
  const perServing = cost.purchaseCost / Math.max(1, household.members.length || 1);
  const costPenalty = Math.min(45, Math.max(0, (perServing - 3.25) * 9));
  score -= costPenalty;
  if (costPenalty < 6) reasons.push("cost efficient");

  // pantry reuse
  const pantryLines = cost.lines.filter((l) => l.fromPantryBase > 0).length;
  if (pantryLines > 0) {
    score += Math.min(18, pantryLines * 5);
    reasons.push(`uses ${pantryLines} pantry item${pantryLines > 1 ? "s" : ""}`);
  }

  // ingredient reuse across the chosen week (package-size intelligence)
  const chosenIds = new Set(chosen.flatMap((m) => m.recipe.ingredients.map((i) => i.ingredientId)));
  const shared = recipe.ingredients.filter((i) => chosenIds.has(i.ingredientId)).length;
  if (shared > 0) {
    score += Math.min(16, shared * 3);
    reasons.push(`shares ${shared} ingredient${shared > 1 ? "s" : ""} with the week`);
  }

  // variety: penalise repeating the dominant protein
  const proteins = new Set(
    chosen.flatMap((m) =>
      m.recipe.ingredients
        .map((i) => INGREDIENT_BY_ID[i.ingredientId])
        .filter((i) => i?.category === "protein")
        .map((i) => i!.id),
    ),
  );
  const repeats = recipe.ingredients.filter(
    (i) => INGREDIENT_BY_ID[i.ingredientId]?.category === "protein" && proteins.has(i.ingredientId),
  ).length;
  score -= repeats * 14;

  // speed relative to the household's tolerance
  if (recipe.totalTimeMinutes <= 30) {
    score += 8;
    reasons.push("30 minutes or less");
  }

  // preference match
  const prefHits = recipe.tags.filter((t) =>
    household.dietaryPreferences.some((p) => p.toLowerCase() === t.toLowerCase()),
  ).length;
  if (prefHits) {
    score += prefHits * 7;
    reasons.push("matches your preferences");
  }

  // recency
  if (history.includes(recipe.id)) score -= 22;

  return { score: Math.round(score * 10) / 10, reasons };
}

export interface PlanRequest {
  household: Household;
  recipes: Recipe[];
  pantry: PantryItem[];
  observations: PriceObservation[];
  storeId: string;
  dinners: number;
  budget: number;
  history?: string[];
}

/**
 * Greedy constrained selection with a budget-repair pass: candidates are
 * re-costed against the pantry as the week fills up, so package remainders
 * from earlier meals reduce the cost of later ones.
 */
export function buildMealPlan(req: PlanRequest): MealPlan {
  const { household, recipes, storeId, observations, dinners, budget } = req;
  const targetServings = householdServings(household);
  const excluded: Exclusion[] = [];

  const eligible = recipes.filter((r) => {
    const reason = isRecipeAllowed(r, household);
    if (reason) excluded.push({ recipeId: r.id, reason });
    return !reason;
  });

  // virtual pantry: real stock plus package remainders accumulated this week
  const virtualPantry: PantryItem[] = req.pantry.map((p) => ({ ...p }));
  const chosen: PlannedMeal[] = [];
  const used = new Set<string>();

  for (let slot = 0; slot < dinners; slot++) {
    let best: PlannedMeal | null = null;

    for (const recipe of eligible) {
      if (used.has(recipe.id)) continue;
      const cost = costRecipe(recipe, {
        storeId,
        observations,
        pantry: virtualPantry,
        targetServings,
      });
      const { score, reasons } = scoreCandidate({
        recipe,
        cost,
        household,
        chosen,
        history: req.history ?? [],
      });

      const remainingBudget = budget - chosen.reduce((s, m) => s + m.cost.purchaseCost, 0);
      const slotsLeft = dinners - slot;
      const overBudget = cost.purchaseCost > remainingBudget / Math.max(1, slotsLeft) * 1.6;
      const adjusted = overBudget ? score - 25 : score;

      if (!best || adjusted > best.score) best = { recipe, cost, score: adjusted, reasons };
    }

    if (!best) break;
    used.add(best.recipe.id);
    chosen.push(best);

    // consume what the meal uses, bank the package remainders
    for (const line of best.cost.lines) {
      if (line.fromPantryBase > 0) consumeVirtual(virtualPantry, line.ingredientId, line.fromPantryBase);
      if (line.remainderBase > 0) {
        virtualPantry.push({
          id: `remainder_${best.recipe.id}_${line.ingredientId}`,
          ingredientId: line.ingredientId,
          quantity: { amount: line.remainderBase, unit: packageUnit(line.ingredientId) },
          origin: "package_remainder",
          addedAt: new Date().toISOString(),
        });
      }
    }
  }

  const totalCost = Math.round(chosen.reduce((s, m) => s + m.cost.purchaseCost, 0) * 100) / 100;

  return {
    meals: chosen,
    totalCost,
    budget,
    targetServings,
    storeId,
    excluded,
    gap: Math.round(Math.max(0, totalCost - budget) * 100) / 100,
    generatedAt: new Date().toISOString(),
  };
}

export function packageUnit(ingredientId: string): string {
  return INGREDIENT_BY_ID[ingredientId]?.packages[0]?.unit ?? "each";
}

function consumeVirtual(pantry: PantryItem[], ingredientId: string, amountBase: number) {
  let remaining = amountBase;
  for (const item of pantry) {
    if (remaining <= 0) break;
    if (item.ingredientId !== ingredientId) continue;
    const have = normalizeToPackageUnit(item.quantity.amount, item.quantity.unit, ingredientId);
    if (have === null) continue;
    const take = Math.min(have, remaining);
    remaining -= take;
    item.quantity = { amount: have - take, unit: packageUnit(ingredientId) };
  }
}
