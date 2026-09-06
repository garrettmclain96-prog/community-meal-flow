import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/hooks/useAuth";

import { loadCatalogPrices, loadCloudState, pushCloudState } from "./cloud";
import {
  buildGroceryList,
  planRemainderPrefix,
  remaindersToPantry,
  type GroceryList,
} from "./grocery";
import {
  buildMealPlan,
  normalizeToPackageUnit,
  packageUnit,
  type MealPlan,
} from "./planner";
import type { PriceObservation } from "./pricing";
import { SEED_RECIPES } from "./recipes";
import type { Household, PantryItem, Recipe } from "./types";

/**
 * Local-first persistence layer.
 *
 * Household-owned data is stored locally and mirrored to Postgres when signed
 * in. Public store-price catalog rows are hydrated separately and never copied
 * into localStorage or the household's price_observations table.
 */

const KEY = "mealforge.state.v1";

type PersistedMealPlan = MealPlan & {
  completedMealSlots?: number[];
  historySnapshot?: string[];
  pantrySnapshot?: PantryItem[];
};

export interface MealForgeState {
  onboarded: boolean;
  household: Household;
  pantry: PantryItem[];
  recipes: Recipe[];
  observations: PriceObservation[];
  history: string[];
  plan: MealPlan | null;
  checked: string[];
}

export const DEFAULT_HOUSEHOLD: Household = {
  id: "hh_local",
  name: "My household",
  members: [
    { id: "m1", name: "Adult 1", ageGroup: "adult", appetite: 1 },
    { id: "m2", name: "Adult 2", ageGroup: "adult", appetite: 1 },
  ],
  weeklyBudget: 90,
  dinnersPerWeek: 5,
  dietaryPreferences: [],
  avoidTags: [],
  allergies: [],
  equipment: ["oven", "skillet", "pot", "sheet pan"],
  storeIds: ["heb"],
  maxCookMinutes: 60,
  createdAt: new Date().toISOString(),
};

function initialState(): MealForgeState {
  return {
    onboarded: false,
    household: DEFAULT_HOUSEHOLD,
    pantry: [],
    recipes: SEED_RECIPES,
    observations: [],
    history: [],
    plan: null,
    checked: [],
  };
}

function load(): MealForgeState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<MealForgeState>;
    const base = initialState();
    return {
      ...base,
      ...parsed,
      household: { ...base.household, ...(parsed.household ?? {}) },
      observations: (parsed.observations ?? []).filter((o) => o.scope !== "catalog"),
      // seeds are code-owned; imported recipes are merged on top
      recipes: [
        ...SEED_RECIPES,
        ...(parsed.recipes ?? []).filter((r) => !SEED_RECIPES.some((s) => s.id === r.id)),
      ],
    };
  } catch {
    return initialState();
  }
}

function snapshotPantry(pantry: PantryItem[]): PantryItem[] {
  return pantry.map((item) => ({ ...item, quantity: { ...item.quantity } }));
}

function buildCurrentPlan(state: MealForgeState): MealPlan {
  const built = buildMealPlan({
    household: state.household,
    recipes: state.recipes,
    pantry: state.pantry,
    observations: state.observations,
    storeId: state.household.storeIds[0] ?? "heb",
    dinners: state.household.dinnersPerWeek,
    budget: state.household.weeklyBudget,
    history: state.history,
  });
  return {
    ...built,
    historySnapshot: state.history,
    pantrySnapshot: snapshotPantry(state.pantry),
  } as MealPlan;
}

interface Ctx {
  state: MealForgeState;
  ready: boolean;
  update: (patch: Partial<MealForgeState>) => void;
  setHousehold: (patch: Partial<Household>) => void;
  addPantryItem: (item: PantryItem) => void;
  removePantryItem: (id: string) => void;
  addRecipe: (recipe: Recipe) => void;
  addPriceObservation: (observation: PriceObservation) => void;
  markMealCooked: (slot: number) => void;
  regeneratePlan: () => MealPlan;
  groceryList: GroceryList | null;
  stockRemainders: () => void;
  toggleChecked: (id: string) => void;
  reset: () => void;
}

const MealForgeContext = createContext<Ctx | null>(null);

export function MealForgeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MealForgeState>(initialState);
  const [ready, setReady] = useState(false);
  const { user } = useAuth();
  const [cloudId, setCloudId] = useState<string | null>(null);
  const hydrating = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(load());
    setReady(true);

    let cancelled = false;
    void loadCatalogPrices()
      .then((catalog) => {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          observations: [...s.observations.filter((o) => o.scope !== "catalog"), ...catalog],
        }));
      })
      .catch(() => {
        /* baseline estimates remain available if public catalog loading fails */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const householdOwnedState = {
        ...state,
        observations: state.observations.filter((o) => o.scope !== "catalog"),
      };
      window.localStorage.setItem(KEY, JSON.stringify(householdOwnedState));
    } catch {
      /* storage full or unavailable — the session still works in memory */
    }
  }, [state, ready]);

  // Sign-in: adopt the cloud household, unless this device has a set-up
  // household and the cloud one is still empty — then the device wins.
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setCloudId(null);
      return;
    }
    let cancelled = false;
    hydrating.current = true;
    loadCloudState(user.id, DEFAULT_HOUSEHOLD)
      .then(({ householdId, state: remote }) => {
        if (cancelled) return;
        setCloudId(householdId);
        setState((s) => {
          if (!remote.onboarded && s.onboarded) {
            return { ...s, household: { ...s.household, id: householdId } };
          }

          const catalog = s.observations.filter((o) => o.scope === "catalog");
          const householdObservations = (remote.observations ?? s.observations).filter(
            (o) => o.scope !== "catalog",
          );
          let merged: MealForgeState = {
            ...s,
            ...remote,
            household: remote.household ?? s.household,
            observations: [...householdObservations, ...catalog],
          } as MealForgeState;

          const cloudPlan = merged.plan as (PersistedMealPlan & { requestedDinners?: number }) | null;
          if (
            merged.onboarded &&
            (!cloudPlan || cloudPlan.requestedDinners !== merged.household.dinnersPerWeek)
          ) {
            merged = { ...merged, plan: buildCurrentPlan(merged), checked: [] };
          }
          return merged;
        });
      })
      .catch(() => {
        /* offline or blocked — the local copy keeps working */
      })
      .finally(() => {
        hydrating.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user?.id]);

  // Mirror every change back to the household's own rows.
  useEffect(() => {
    if (!ready || !cloudId || hydrating.current) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      void pushCloudState(cloudId, state).catch(() => {
        /* local-first state remains available; a later change retries sync */
      });
    }, 800);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [state, ready, cloudId]);

  const update = useCallback((patch: Partial<MealForgeState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const setHousehold = useCallback((patch: Partial<Household>) => {
    setState((s) => ({ ...s, household: { ...s.household, ...patch } }));
  }, []);

  const addPantryItem = useCallback((item: PantryItem) => {
    setState((s) => ({ ...s, pantry: [...s.pantry, item] }));
  }, []);

  const removePantryItem = useCallback((id: string) => {
    setState((s) => ({ ...s, pantry: s.pantry.filter((p) => p.id !== id) }));
  }, []);

  const addRecipe = useCallback((recipe: Recipe) => {
    setState((s) => ({ ...s, recipes: [recipe, ...s.recipes.filter((r) => r.id !== recipe.id)] }));
  }, []);

  const addPriceObservation = useCallback((observation: PriceObservation) => {
    const normalized: PriceObservation = {
      ...observation,
      provenance: "RECENT_OBSERVED",
      scope: "household",
    };
    setState((s) => ({
      ...s,
      observations: [
        normalized,
        ...s.observations.filter(
          (o) =>
            !(
              o.scope !== "catalog" &&
              o.ingredientId === normalized.ingredientId &&
              o.storeId === normalized.storeId &&
              o.packageLabel === normalized.packageLabel
            ),
        ),
      ],
    }));
  }, []);

  const markMealCooked = useCallback((slot: number) => {
    setState((s) => {
      if (!s.plan || slot < 0 || slot >= s.plan.meals.length) return s;
      const plan = s.plan as PersistedMealPlan;
      const completed = plan.completedMealSlots ?? [];
      if (completed.includes(slot)) return s;

      const meal = plan.meals[slot]!;
      const protectedPrefix = planRemainderPrefix(plan.generatedAt);
      const pantry = snapshotPantry(s.pantry);

      for (const line of meal.cost.lines) {
        let remaining = line.fromPantryBase;
        if (remaining <= 0) continue;

        for (const item of pantry) {
          if (remaining <= 0) break;
          if (item.ingredientId !== line.ingredientId || item.id.startsWith(protectedPrefix)) continue;
          const have = normalizeToPackageUnit(
            item.quantity.amount,
            item.quantity.unit,
            line.ingredientId,
          );
          if (have === null || have <= 0) continue;
          const take = Math.min(have, remaining);
          remaining -= take;
          item.quantity = {
            amount: Math.max(0, Math.round((have - take) * 1000) / 1000),
            unit: packageUnit(line.ingredientId),
          };
        }
      }

      const nextHistory = [meal.recipe.id, ...s.history.filter((id) => id !== meal.recipe.id)].slice(
        0,
        60,
      );
      const nextPlan = {
        ...plan,
        completedMealSlots: [...completed, slot].sort((a, b) => a - b),
        historySnapshot: nextHistory,
      } as MealPlan;

      return {
        ...s,
        plan: nextPlan,
        pantry: pantry.filter((item) => item.quantity.amount > 0.001),
        history: nextHistory,
      };
    });
  }, []);

  const regeneratePlan = useCallback(() => {
    let next: MealPlan | null = null;
    setState((s) => {
      const plan = buildCurrentPlan(s);
      next = plan;
      return { ...s, plan, checked: [] };
    });
    return next as unknown as MealPlan;
  }, []);

  const groceryList = useMemo(
    () => (state.plan ? buildGroceryList(state.plan, state.pantry, state.observations) : null),
    [state.plan, state.pantry, state.observations],
  );

  const stockRemainders = useCallback(() => {
    setState((s) => {
      if (!s.plan) return s;
      const list = buildGroceryList(s.plan, s.pantry, s.observations);
      const remainders = remaindersToPantry(list, s.plan.generatedAt);
      const replacementIds = new Set(remainders.map((item) => item.id));
      return {
        ...s,
        pantry: [...s.pantry.filter((item) => !replacementIds.has(item.id)), ...remainders],
      };
    });
  }, []);

  const toggleChecked = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      checked: s.checked.includes(id) ? s.checked.filter((c) => c !== id) : [...s.checked, id],
    }));
  }, []);

  const reset = useCallback(() => setState(initialState()), []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      update,
      setHousehold,
      addPantryItem,
      removePantryItem,
      addRecipe,
      addPriceObservation,
      markMealCooked,
      regeneratePlan,
      groceryList,
      stockRemainders,
      toggleChecked,
      reset,
    }),
    [
      state,
      ready,
      update,
      setHousehold,
      addPantryItem,
      removePantryItem,
      addRecipe,
      addPriceObservation,
      markMealCooked,
      regeneratePlan,
      groceryList,
      stockRemainders,
      toggleChecked,
      reset,
    ],
  );

  return <MealForgeContext.Provider value={value}>{children}</MealForgeContext.Provider>;
}

export function useMealForge(): Ctx {
  const ctx = useContext(MealForgeContext);
  if (!ctx) throw new Error("useMealForge must be used inside MealForgeProvider");
  return ctx;
}
