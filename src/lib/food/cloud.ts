import { supabase } from "@/integrations/supabase/client";

import type { MealPlan } from "./planner";
import { SEED_RECIPES } from "./recipes";
import type { MealForgeState } from "./store";
import type { Household, PantryItem, Recipe } from "./types";

/**
 * Cloud repository for MealForge.
 *
 * The UI never talks to the database directly. The local-first store keeps
 * working offline and signed-out; when a session exists we hydrate from these
 * tables and mirror every change back. Row-level security scopes everything to
 * the household the signed-in user owns.
 */

export interface CloudSnapshot {
  householdId: string;
  state: Partial<MealForgeState>;
}

async function getOrCreateHousehold(userId: string, fallback: Household) {
  const { data: existing } = await supabase
    .from("households")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
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
  if (error) throw error;
  return data;
}

export async function loadCloudState(
  userId: string,
  fallback: Household,
): Promise<CloudSnapshot> {
  const hh = await getOrCreateHousehold(userId, fallback);

  const [members, pantry, recipes, plans] = await Promise.all([
    supabase.from("household_members").select("*").eq("household_id", hh.id),
    supabase.from("pantry_items").select("*").eq("household_id", hh.id),
    supabase.from("recipes").select("*").eq("household_id", hh.id),
    supabase
      .from("meal_plans")
      .select("*")
      .eq("household_id", hh.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

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
    avoidTags: hh.avoid_tags,
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
      plan: latest ? (latest.plan as unknown as MealPlan) : null,
      checked: latest ? latest.checked : [],
    },
  };
}

/** Mirrors the whole household document. Small data, simple and always correct. */
export async function pushCloudState(householdId: string, state: MealForgeState) {
  const h = state.household;

  await supabase
    .from("households")
    .update({
      name: h.name,
      weekly_budget: h.weeklyBudget,
      dinners_per_week: h.dinnersPerWeek,
      max_cook_minutes: h.maxCookMinutes,
      store_ids: h.storeIds,
      equipment: h.equipment,
      dietary_preferences: h.dietaryPreferences,
      avoid_tags: h.avoidTags,
      allergies: h.allergies,
      onboarded: state.onboarded,
    })
    .eq("id", householdId);

  await supabase.from("household_members").delete().eq("household_id", householdId);
  if (h.members.length > 0) {
    await supabase.from("household_members").insert(
      h.members.map((m) => ({
        household_id: householdId,
        name: m.name,
        age_group: m.ageGroup,
        appetite: m.appetite,
      })),
    );
  }

  await supabase.from("pantry_items").delete().eq("household_id", householdId);
  if (state.pantry.length > 0) {
    await supabase.from("pantry_items").insert(
      state.pantry.map((p) => ({
        household_id: householdId,
        ingredient_id: p.ingredientId,
        amount: p.quantity.amount,
        unit: p.quantity.unit,
        origin: p.origin,
        expires_at: p.expiresAt ?? null,
      })),
    );
  }

  const imported = state.recipes.filter((r) => !SEED_RECIPES.some((s) => s.id === r.id));
  await supabase.from("recipes").delete().eq("household_id", householdId);
  if (imported.length > 0) {
    await supabase.from("recipes").insert(
      imported.map((r) => ({
        household_id: householdId,
        slug: r.id,
        title: r.title,
        servings: r.servings,
        total_time_minutes: r.totalTimeMinutes,
        steps: r.steps,
        ingredients: r.ingredients as unknown as never,
        tags: r.tags,
        equipment: r.equipment,
        source: r.source as unknown as never,
      })),
    );
  }

  await supabase.from("meal_plans").delete().eq("household_id", householdId);
  if (state.plan) {
    await supabase.from("meal_plans").insert({
      household_id: householdId,
      plan: state.plan as unknown as never,
      checked: state.checked,
    });
  }
}
