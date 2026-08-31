import { createFileRoute, Link } from "@tanstack/react-router";

import { PROVENANCE_LABEL, STORE_BY_ID } from "@/lib/food/pricing";
import { useMealForge } from "@/lib/food/store";
import { INGREDIENT_BY_ID } from "@/lib/food/ingredients";

export const Route = createFileRoute("/app/plan")({
  head: () => ({
    meta: [
      { title: "Weekly Plan — MealForge" },
      {
        name: "description",
        content:
          "A scored week of dinners chosen by constraint, pantry reuse and package-size economics — never invented by a model.",
      },
      { property: "og:title", content: "Weekly Plan — MealForge" },
      {
        property: "og:description",
        content: "A scored week of dinners chosen by constraint, pantry reuse and package economics.",
      },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { state, ready, regeneratePlan } = useMealForge();
  const { plan, household } = state;

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">This week</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {household.dinnersPerWeek} dinners · budget ${household.weeklyBudget.toFixed(2)} ·{" "}
            {STORE_BY_ID[household.storeIds[0] ?? "heb"]?.name}
          </p>
        </div>
        <button
          onClick={() => regeneratePlan()}
          className="rounded-sm bg-ember px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {plan ? "Rebuild plan" : "Build plan"}
        </button>
      </header>

      {!plan && (
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted-foreground">
          No plan yet. Building one runs constraint filtering across your allergies, avoided
          ingredients, equipment and time limit, then scores every eligible recipe on cost per
          serving, pantry reuse, shared packages and variety.
        </p>
      )}

      {plan && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Box label="Plan cost" value={`$${plan.totalCost.toFixed(2)}`} />
            <Box label="Budget" value={`$${plan.budget.toFixed(2)}`} />
            <Box
              label={plan.gap > 0 ? "Gap" : "Headroom"}
              value={`$${(plan.gap > 0 ? plan.gap : plan.budget - plan.totalCost).toFixed(2)}`}
            />
          </div>

          <ol className="space-y-3">
            {plan.meals.map((meal, i) => (
              <li key={meal.recipe.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Dinner {i + 1}
                    </p>
                    <h2 className="font-display text-xl font-bold">{meal.recipe.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meal.recipe.totalTimeMinutes} min · $
                      {meal.cost.costPerServing.toFixed(2)}/serving · score {meal.score}
                    </p>
                  </div>
                  <p className="font-display text-lg font-bold">
                    ${meal.cost.purchaseCost.toFixed(2)}
                  </p>
                </div>

                {meal.reasons.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {meal.reasons.map((r) => (
                      <li
                        key={r}
                        className="rounded-sm border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                )}

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                    Cost breakdown
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs">
                    {meal.cost.lines.map((l) => (
                      <li key={l.ingredientId} className="flex justify-between gap-3">
                        <span>
                          {INGREDIENT_BY_ID[l.ingredientId]?.name ?? l.ingredientId}
                          {l.fromPantryBase > 0 && (
                            <span className="text-ember-text"> · from pantry</span>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {l.packagesToBuy > 0 ? `${l.packagesToBuy} × ${l.packageLabel} · ` : ""}$
                          {l.cost.toFixed(2)} ·{" "}
                          {PROVENANCE_LABEL[l.provenance as keyof typeof PROVENANCE_LABEL] ??
                            l.provenance}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ol>

          <Link
            to="/app/shop"
            className="inline-flex rounded-sm border border-border px-4 py-2 text-sm font-semibold hover:border-ember/50"
          >
            Build the grocery list →
          </Link>

          {plan.excluded.length > 0 && (
            <details className="rounded-lg border border-border bg-surface p-4">
              <summary className="cursor-pointer text-sm font-medium">
                {plan.excluded.length} recipes excluded by your constraints
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {plan.excluded.map((e) => (
                  <li key={e.recipeId}>
                    {e.recipeId}: {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
