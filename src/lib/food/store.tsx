import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { loadCloudState, pushCloudState } from "./cloud";
import { buildGroceryList, remaindersToPantry, type GroceryList } from "./grocery";
import { buildMealPlan, type MealPlan } from "./planner";
import type { PriceObservation } from "./pricing";
import { SEED_RECIPES } from "./recipes";
import type { Household, PantryItem, Recipe } from "./types";


/**
 * Local-first persistence layer.
 *
 * Everything the MealForge experience needs is written through this one
 * repository interface. When Lovable Cloud is enabled, the same interface is
 * re-implemented against Postgres tables and the UI does not change.
 */

const KEY = "mealforge.state.v1";

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

interface Ctx {
  state: MealForgeState;
  ready: boolean;
  update: (patch: Partial<MealForgeState>) => void;
  setHousehold: (patch: Partial<Household>) => void;
  addPantryItem: (item: PantryItem) => void;
  removePantryItem: (id: string) => void;
  addRecipe: (recipe: Recipe) => void;
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
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
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
          if (!remote.onboarded && s.onboarded) return { ...s, household: { ...s.household, id: householdId } };
          return { ...s, ...remote, household: remote.household ?? s.household };
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
        /* retried on the next change */
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

  const regeneratePlan = useCallback(() => {
    let next: MealPlan | null = null;
    setState((s) => {
      const plan = buildMealPlan({
        household: s.household,
        recipes: s.recipes,
        pantry: s.pantry,
        observations: s.observations,
        storeId: s.household.storeIds[0] ?? "heb",
        dinners: s.household.dinnersPerWeek,
        budget: s.household.weeklyBudget,
        history: s.history,
      });
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
      return { ...s, pantry: [...s.pantry, ...remaindersToPantry(list)] };
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
