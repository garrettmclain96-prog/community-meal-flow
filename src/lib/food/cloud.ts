import { supabase } from "@/integrations/supabase/client";

import type { MealPlan } from "./planner";
import type { PriceObservation } from "./pricing";
import { SEED_RECIPES } from "./recipes";
import type { MealForgeState } from "./store";
import type { Household, PantryItem, Recipe } from "./types";

type StoredMealPlan = MealPlan & {
  completedMealSlots?: number[];
  historySnapshot?: string[];
};

/**
 * Cloud repository for MealForge.
 *
 * The UI never talks to the database directly. The local-first store keeps
 * working offline and signed-out; when a session exists we hydrate from these
 * tables and mirror every change back. Row-level security scopes household data.
 */

export interface CloudSnapshot {
  householdId: string;
  state: Partial<MealForgeState>;
}

function assertOk(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`${operation}: ${error.message}`);
}

export async function loadCatalogPrices(): Promise<PriceObservation[]> {
  const { data, error } = await supabase
    .from("ingredient_prices")
    .select("ingredient_id, store_id, package_label, price, provenance, observed_at");
  assertOk(error, "Load store price catalog");

  return (data ?? []).map((row) => ({
    ingredientId: row.ingredient_id,
    storeId: row.store_id,
    packageLabel: row.package_label,
    price: Number(row.price),
    observedAt: row.observed_at,
    provenance: row.provenance as PriceObservation["provenance"],
    scope: "catalog" as const,
  }));
}

async function getOrCreateHousehold(userId: string, fallback: Household) {
  const existingResult = await supabase
    .from("households")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existingResult.error) throw new Error(`Load household: ${existingResult.error.message}`);
  if (existingResult.data) return existingResult.data;

  const created = await supabase
    .from("households")
    .insert({
      owner_id: userId,
      name: fallback.name,
      weekly_budget: fallback.weeklyBudget,
      dinners_per_week: fallback.dinnersPerWeek,
      max_cook_minutes: fallback.maxCookMinutes,
      store_ids: fallback.storeIds,
      equipment: fallback.equipment,
      dietary_preferences: fallback.dietaryPreferences,
      avoid_tags: fallback.avoidTags,
      allergies: fallback.allergies,
      onboarded: false,
    })
    .select("*")
    .single();
  if (created.error || !created.data) {
    throw new Error(`Create household: ${created.error?.message ?? "No household returned"}`);
  }
  return created.data;
}

export async function loadCloudState(userId: string, fallback: Household): Promise<CloudSnapshot> {
  const hh = await getOrCreateHousehold(userId, fallback);

  const [members, pantry, recipes, plans, observations] = await Promise.all([
    supabase.from("household_members").select("*").eq("household_id", hh.id),
    supabase.from("pantry_items").select("*").eq("household_id", hh.id),
    supabase.from("recipes").select("*").eq("household_id", hh.id),
    supabase
      .from("meal_plans")
      .select("*")
      .eq("household_id", hh.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("price_observations")
      .select("*")
      .eq("household_id", hh.id)
      .order("observed_at", { ascending: false }),
  ]);

  assertOk(members.error, "Load household members");
  assertOk(pantry.error, "Load pantry");
  assertOk(recipes.error, "Load recipes");
  assertOk(plans.error, "Load meal plan");
  assertOk(observations.error, "Load price observations");

  const household: Household = {
    id: hh.id,
    name: hh.name,
    members: (members.data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      ageGroup: m.age_group as Household["members"][number]["ageGroup"],
      appetite: Number(m.appetite),
    })),
    weeklyBudget: Number(hh.weekly_budget),
    dinnersPerWeek: hh.dinners_per_week,
    dietaryPreferences: hh.dietary_preferences as unknown as Household["dietaryPreferences"],
    avoidTags: hh.avoid_tags as unknown as Household["avoidTags"],
    allergies: hh.allergies as unknown as Household["allergies"],
    equipment: hh.equipment,
    storeIds: hh.store_ids,
    maxCookMinutes: hh.max_cook_minutes,
    createdAt: hh.created_at,
  };
  if (household.members.length === 0) household.members = fallback.members;

  const imported: Recipe[] = (recipes.data ?? []).map((r) => ({
    id: r.slug,
    title: r.title,
    servings: r.servings,
    totalTimeMinutes: r.total_time_minutes,
    steps: r.steps as unknown as string[],
    ingredients: r.ingredients as unknown as Recipe["ingredients"],
    tags: r.tags,
    equipment: r.equipment,
    source: r.source as unknown as Recipe["source"],
  }));

  const latest = plans.data?.[0];
  const storedPlan = latest ? (latest.plan as unknown as StoredMealPlan) : null;

  return {
    householdId: hh.id,
    state: {
      onboarded: hh.onboarded,
      household,
      pantry: (pantry.data ?? []).map<PantryItem>((p) => ({
        id: p.id,
        ingredientId: p.ingredient_id,
        quantity: { amount: Number(p.amount), unit: p.unit as PantryItem["quantity"]["unit"] },
        origin: p.origin as PantryItem["origin"],
        addedAt: p.added_at,
        ...(p.expires_at ? { expiresAt: p.expires_at } : {}),
      })),
      recipes: [
        ...SEED_RECIPES,
        ...imported.filter((r) => !SEED_RECIPES.some((s) => s.id === r.id)),
      ],
      observations: (observations.data ?? []).map((o) => ({
        ingredientId: o.ingredient_id,
        storeId: o.store_id,
        packageLabel: o.package_label ?? "",
        price: Number(o.price),
        observedAt: o.observed_at,
        provenance: "RECENT_OBSERVED" as const,
        scope: "household" as const,
      })),
      history: storedPlan?.historySnapshot ?? [],
      plan: storedPlan,
      checked: latest ? latest.checked : [],
    },
  };
}

/**
 * Supabase snapshot writes are serialized so a slower, older request cannot
 * finish after a newer request and overwrite it. Each database write is itself
 * atomic through sync_mealforge_snapshot(), so a network failure cannot leave
 * the child collections half-deleted.
 */
let syncQueue: Promise<void> = Promise.resolve();

/** Mirrors the household-owned document. Public catalog rows are never copied into household data. */
export function pushCloudState(householdId: string, state: MealForgeState): Promise<void> {
  const imported = state.recipes.filter((r) => !SEED_RECIPES.some((s) => s.id === r.id));
  const householdObservations = state.observations.filter((o) => o.scope !== "catalog");
  const snapshot = {
    onboarded: state.onboarded,
    household: state.household,
    pantry: state.pantry,
    recipes: imported,
    observations: householdObservations,
    plan: state.plan,
    checked: state.checked,
  };

  syncQueue = syncQueue
    .catch(() => {
      // A failed earlier write must not permanently poison later retries.
    })
    .then(async () => {
      // The generated database types on main lag this additive RPC until this
      // branch lands; runtime argument shape is enforced by Postgres.
      const { error } = await supabase.rpc(
        "sync_mealforge_snapshot" as never,
        { _household_id: householdId, _snapshot: snapshot } as never,
      );
      assertOk(error, "Sync MealForge snapshot");
    });

  return syncQueue;
}
