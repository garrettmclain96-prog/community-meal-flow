import { describe, expect, test } from "bun:test";

import { buildMealPlan, isRecipeAllowed } from "../src/lib/food/planner";
import { SEED_RECIPES } from "../src/lib/food/recipes";
import type { Household, Recipe } from "../src/lib/food/types";

const household: Household = {
  id: "test-household",
  name: "Test household",
  members: [
    { id: "adult-1", name: "Adult 1", ageGroup: "adult", appetite: 1 },
    { id: "adult-2", name: "Adult 2", ageGroup: "adult", appetite: 1 },
  ],
  weeklyBudget: 500,
  dinnersPerWeek: 7,
  dietaryPreferences: [],
  avoidTags: [],
  allergies: [],
  equipment: [],
  storeIds: ["heb"],
  maxCookMinutes: 500,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("MealForge planner invariants", () => {
  test("returns the requested number of dinners when at least one recipe is eligible", () => {
    const plan = buildMealPlan({
      household: { ...household, dinnersPerWeek: 30 },
      recipes: SEED_RECIPES,
      pantry: [],
      observations: [],
      storeId: "heb",
      dinners: 30,
      budget: 500,
      history: [],
    });

    expect(plan.meals).toHaveLength(30);
    expect(plan.requestedDinners).toBe(30);
    expect(plan.uniqueEligibleRecipes).toBeGreaterThan(0);
    expect(plan.repeatedMeals).toBeGreaterThan(0);
    expect(plan.constraintLimited).toBe(true);
  });

  test("custom ingredient exclusions are hard constraints", () => {
    const taco = SEED_RECIPES.find((recipe) => recipe.id === "black_bean_tacos");
    expect(taco).toBeDefined();

    const reason = isRecipeAllowed(taco!, {
      ...household,
      avoidTags: ["sweet potato"],
    });

    expect(reason).toContain("sweet potato");
  });

  test("recipes with unresolved imported ingredients never enter automatic planning", () => {
    const base = SEED_RECIPES[0]!;
    const unresolved: Recipe = {
      ...base,
      id: "unresolved-import",
      source: {
        ...base.source,
        kind: "url",
        unmatchedIngredients: ["1 mystery sauce packet"],
      },
    };

    expect(isRecipeAllowed(unresolved, household)).toContain("needs ingredient mapping");

    const plan = buildMealPlan({
      household: { ...household, dinnersPerWeek: 1 },
      recipes: [unresolved],
      pantry: [],
      observations: [],
      storeId: "heb",
      dinners: 1,
      budget: 100,
      history: [],
    });

    expect(plan.meals).toHaveLength(0);
    expect(plan.excluded[0]?.reason).toContain("needs ingredient mapping");
  });
});
