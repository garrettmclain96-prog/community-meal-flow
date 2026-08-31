import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { INGREDIENT_BY_ID } from "@/lib/food/ingredients";
import { householdServings } from "@/lib/food/planner";
import { useMealForge } from "@/lib/food/store";
import { formatQuantity } from "@/lib/food/units";

export const Route = createFileRoute("/app/cook")({
  head: () => ({
    meta: [
      { title: "Cook — MealForge" },
      {
        name: "description",
        content:
          "Cook tonight's dinner with ingredients already scaled to your household and steps you can follow hands-free.",
      },
      { property: "og:title", content: "Cook — MealForge" },
      {
        property: "og:description",
        content: "Tonight's dinner, scaled to your household, step by step.",
      },
    ],
  }),
  component: CookPage,
});

function CookPage() {
  const { state, ready } = useMealForge();
  const [openId, setOpenId] = useState<string | null>(null);
  const [done, setDone] = useState<number[]>([]);

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!state.plan || state.plan.meals.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h1 className="font-display text-2xl font-bold">Nothing planned yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Build a week and every dinner shows up here, scaled to your household.
        </p>
        <Link
          to="/app/plan"
          className="mt-4 inline-flex rounded-sm bg-ember px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Go to Plan
        </Link>
      </div>
    );
  }

  const servings = householdServings(state.household);
  const active = state.plan.meals.find((m) => m.recipe.id === openId);

  if (active) {
    const scale = servings / active.recipe.servings;
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setOpenId(null);
            setDone([]);
          }}
          className="text-xs font-medium text-muted-foreground hover:text-ember-text"
        >
          ← Back to the week
        </button>

        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight">{active.recipe.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active.recipe.totalTimeMinutes} min · scaled to {servings} servings
          </p>
        </header>

        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Ingredients
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {active.recipe.ingredients.map((ing) => (
              <li key={ing.ingredientId} className="flex justify-between gap-3">
                <span>{INGREDIENT_BY_ID[ing.ingredientId]?.name ?? ing.ingredientId}</span>
                <span className="text-muted-foreground">
                  {formatQuantity({
                    amount: Math.round(ing.quantity.amount * scale * 100) / 100,
                    unit: ing.quantity.unit,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <ol className="space-y-2">
          {active.recipe.steps.map((step, i) => (
            <li key={i}>
              <button
                onClick={() =>
                  setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))
                }
                className={`w-full rounded-lg border p-4 text-left text-sm transition-colors ${
                  done.includes(i)
                    ? "border-ember/40 bg-ember/5 text-muted-foreground line-through"
                    : "border-border bg-surface"
                }`}
              >
                <span className="mr-2 font-display font-bold text-ember-text">{i + 1}</span>
                {step}
              </button>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Cook</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick tonight's dinner.</p>
      </header>
      <ul className="space-y-3">
        {state.plan.meals.map((meal) => (
          <li key={meal.recipe.id}>
            <button
              onClick={() => setOpenId(meal.recipe.id)}
              className="w-full rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-ember/50"
            >
              <p className="font-display text-lg font-bold">{meal.recipe.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {meal.recipe.totalTimeMinutes} min · {meal.recipe.steps.length} steps · $
                {meal.cost.costPerServing.toFixed(2)}/serving
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
