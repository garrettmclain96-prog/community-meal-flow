import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";

import { INGREDIENT_BY_ID } from "@/lib/food/ingredients";
import { householdServings, type MealPlan } from "@/lib/food/planner";
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

type CookablePlan = MealPlan & { completedMealSlots?: number[] };

function CookPage() {
  const { state, ready, markMealCooked } = useMealForge();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  const plan = state.plan as CookablePlan;
  const completed = plan.completedMealSlots ?? [];
  const servings = householdServings(state.household);
  const active = openIndex === null ? null : plan.meals[openIndex];

  if (active && openIndex !== null) {
    const scale = servings / active.recipe.servings;
    const cooked = completed.includes(openIndex);
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setOpenIndex(null);
            setDone([]);
          }}
          className="min-h-11 text-xs font-medium text-muted-foreground hover:text-ember-text"
        >
          ← Back to the week
        </button>

        <header>
          <p className="kicker text-primary">
            Dinner {openIndex + 1} of {plan.meals.length}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{active.recipe.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active.recipe.totalTimeMinutes} min · scaled to {servings} servings
          </p>
        </header>

        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Ingredients
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {active.recipe.ingredients.map((ing, index) => (
              <li key={`${ing.ingredientId}_${index}`} className="flex justify-between gap-3">
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
                  setDone((current) =>
                    current.includes(i) ? current.filter((x) => x !== i) : [...current, i],
                  )
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

        <section className="rounded-lg border border-border bg-surface p-4">
          {cooked ? (
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-4" />
              </div>
              <div>
                <p className="font-bold">Dinner completed</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  MealForge recorded this meal and deducted the pantry stock it actually used. It
                  will also deprioritize this recipe when you build a future week.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold">Finished cooking?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Marking the dinner complete updates your pantry and meal history. This action is
                intentionally one-way so stock is never accidentally restored.
              </p>
              <button
                type="button"
                onClick={() => markMealCooked(openIndex)}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                <Check className="size-4" /> Mark dinner cooked
              </button>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Cook</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {completed.length} of {plan.meals.length} dinners completed.
        </p>
      </header>
      <ul className="space-y-3">
        {plan.meals.map((meal, index) => {
          const cooked = completed.includes(index);
          return (
            <li key={`${meal.recipe.id}_${index}`}>
              <button
                onClick={() => {
                  setOpenIndex(index);
                  setDone([]);
                }}
                className="w-full rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-ember/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Dinner {index + 1}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold">{meal.recipe.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meal.recipe.totalTimeMinutes} min · {meal.recipe.steps.length} steps · $
                      {meal.cost.costPerServing.toFixed(2)}/serving
                    </p>
                  </div>
                  {cooked && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
                      <Check className="size-3.5" /> Cooked
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
