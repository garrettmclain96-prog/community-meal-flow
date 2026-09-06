import { findCustomConstraint } from "./constraints";
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
  return Math.max(1, Math.round(household.members.reduce((s, m) => s + m.appetite, 0)));
}

export interface Exclusion {
  recipeId: string;
  reason: string;
}

export function isRecipeAllowed(recipe: Recipe, household: Household): string | null {
  const unresolved = recipe.source.unmatchedIngredients?.filter((line) => line.trim()) ?? [];
  if (unresolved.length > 0) {
    return `needs ingredient mapping (${unresolved.length} unresolved)`;
  }

  for (const item of recipe.ingredients) {
    if (item.optional) continue;
    const ing = INGREDIENT_BY_ID[item.ingredientId];
    if (!ing) {
      const customAllergy = findCustomConstraint(item, household.allergies);
      if (customAllergy) return `matches allergy/intolerance: ${customAllergy}`;
      const customAvoid = findCustomConstraint(item, household.avoidTags);
      if (customAvoid) return `contains excluded ingredient: ${customAvoid}`;
      return "needs ingredient mapping (unknown ingredient)";
    }

    // Structured metadata remains the highest-confidence check.
    const allergen = ing.allergens.find((a) => household.allergies.includes(a));
    if (allergen) return `contains ${allergen.replace("_", " ")}`;
    const avoided = ing.diet.find((d) => household.avoidTags.includes(d));
    if (avoided) return `contains ${avoided}`;

    // User-defined constraints also match ingredient names, aliases, ids, and
    // verbatim imported ingredient lines when available.
    const customAllergy = findCustomConstraint(item, household.allergies);
    if (customAllergy) return `matches allergy/intolerance: ${customAllergy}`;
    const customAvoid = findCustomConstraint(item, household.avoidTags);
    if (customAvoid) return `contains excluded ingredient: ${customAvoid}`;
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
  requestedDinners: number;
  uniqueEligibleRecipes: number;
  repeatedMeals: number;
  constraintLimited: boolean;
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

function chooseBestMeal({
  eligible,
  chosen,
  virtualPantry,
  targetServings,
  storeId,
  observations,
  household,
  history,
  budget,
  dinners,
  allowRepeats,
}: {
  eligible: Recipe[];
  chosen: PlannedMeal[];
  virtualPantry: PantryItem[];
  targetServings: number;
  storeId: string;
  observations: PriceObservation[];
  household: Household;
  history: string[];
  budget: number;
  dinners: number;
  allowRepeats: boolean;
}): PlannedMeal | null {
  const used = new Set(chosen.map((meal) => meal.recipe.id));
  let best: PlannedMeal | null = null;

  for (const recipe of eligible) {
    if (!allowRepeats && used.has(recipe.id)) continue;

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
      history,
    });

    const repeatCount = chosen.filter((meal) => meal.recipe.id === recipe.id).length;
    const remainingBudget = budget - chosen.reduce((sum, meal) => sum + meal.cost.purchaseCost, 0);
    const slotsLeft = Math.max(1, dinners - chosen.length);
    const overBudget = cost.purchaseCost > (remainingBudget / slotsLeft) * 1.6;
    let adjusted = overBudget ? score - 25 : score;
    const nextReasons = [...reasons];

    if (repeatCount > 0) {
      adjusted -= repeatCount * 30;
      nextReasons.push("repeated because your current constraints limit unique options");
    }

    if (!best || adjusted > best.score) {
      best = { recipe, cost, score: Math.round(adjusted * 10) / 10, reasons: nextReasons };
    }
  }

  return best;
}

function applyMealToVirtualPantry(meal: PlannedMeal, virtualPantry: PantryItem[]) {
  for (const line of meal.cost.lines) {
    if (line.fromPantryBase > 0) {
      consumeVirtual(virtualPantry, line.ingredientId, line.fromPantryBase);
    }
    if (line.remainderBase > 0) {
      virtualPantry.push({
        id: `remainder_${meal.recipe.id}_${line.ingredientId}_${virtualPantry.length}`,
        ingredientId: line.ingredientId,
        quantity: { amount: line.remainderBase, unit: packageUnit(line.ingredientId) },
        origin: "package_remainder",
        addedAt: new Date().toISOString(),
      });
    }
  }
}

/**
 * Greedy constrained selection with a budget-repair pass. Unique recipes are
 * preferred. If the household asks for more dinners than the current hard
 * constraints allow uniquely, MealForge deliberately repeats the best eligible
 * meals instead of silently returning an incomplete week.
 */
export function buildMealPlan(req: PlanRequest): MealPlan {
  const { household, recipes, storeId, observations, dinners, budget } = req;
  const targetServings = householdServings(household);
  const excluded: Exclusion[] = [];

  const eligible = recipes.filter((recipe) => {
    const reason = isRecipeAllowed(recipe, household);
    if (reason) excluded.push({ recipeId: recipe.id, reason });
    return !reason;
  });

  // virtual pantry: real stock plus package remainders accumulated this week
  const virtualPantry: PantryItem[] = req.pantry.map((item) => ({ ...item }));
  const chosen: PlannedMeal[] = [];
  const history = req.history ?? [];

  while (chosen.length < dinners && chosen.length < eligible.length) {
    const best = chooseBestMeal({
      eligible,
      chosen,
      virtualPantry,
      targetServings,
      storeId,
      observations,
      household,
      history,
      budget,
      dinners,
      allowRepeats: false,
    });
    if (!best) break;
    chosen.push(best);
    applyMealToVirtualPantry(best, virtualPantry);
  }

  while (chosen.length < dinners && eligible.length > 0) {
    const best = chooseBestMeal({
      eligible,
      chosen,
      virtualPantry,
      targetServings,
      storeId,
      observations,
      household,
      history,
      budget,
      dinners,
      allowRepeats: true,
    });
    if (!best) break;
    chosen.push(best);
    applyMealToVirtualPantry(best, virtualPantry);
  }

  const totalCost = Math.round(chosen.reduce((sum, meal) => sum + meal.cost.purchaseCost, 0) * 100) / 100;
  const distinctChosen = new Set(chosen.map((meal) => meal.recipe.id)).size;

  return {
    meals: chosen,
    totalCost,
    budget,
    targetServings,
    storeId,
    excluded,
    requestedDinners: dinners,
    uniqueEligibleRecipes: eligible.length,
    repeatedMeals: Math.max(0, chosen.length - distinctChosen),
    constraintLimited: eligible.length < dinners,
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
