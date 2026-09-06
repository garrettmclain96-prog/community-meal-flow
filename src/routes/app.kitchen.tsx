import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { INGREDIENT_BY_ID } from "@/lib/food/ingredients";
import { useMealForge } from "@/lib/food/store";
import { formatQuantity } from "@/lib/food/units";

export const Route = createFileRoute("/app/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen — MealForge" },
      {
        name: "description",
        content:
          "Your pantry inventory and recipe library: canonical ingredients, tracked leftovers and every imported recipe with its source and confidence.",
      },
      { property: "og:title", content: "Kitchen — MealForge" },
      {
        property: "og:description",
        content: "Pantry inventory and recipe library, normalized against the ingredient graph.",
      },
    ],
  }),
  component: KitchenPage,
});

function KitchenPage() {
  const { state, ready, removePantryItem } = useMealForge();

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <header>
        <p className="kicker text-primary">Your food system</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight">
          Pantry + recipe library
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What you already own, and what you know how to cook.
        </p>
      </header>

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Pantry · {state.pantry.length} items
          </h2>
          <Link
            to="/app/pantry"
            className="rounded-sm bg-ember px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Add items
          </Link>
        </div>

        {state.pantry.length === 0 ? (
          <p className="mt-2 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
            Nothing stocked yet. Anything you add here reduces next week's grocery list before a
            single package gets bought.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
            {state.pantry.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span>
                  <span className="font-medium">
                    {INGREDIENT_BY_ID[item.ingredientId]?.name ?? item.ingredientId}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatQuantity(item.quantity)} ·{" "}
                    {item.origin === "package_remainder" ? "package leftover" : item.origin}
                  </span>
                </span>
                <button
                  onClick={() => removePantryItem(item.id)}
                  className="min-h-10 px-2 text-xs text-muted-foreground hover:text-ember-text"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Recipes · {state.recipes.length}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Recipes with unresolved ingredients stay in your library but are excluded from automatic planning until their ingredient data is complete.
            </p>
          </div>
          <Link
            to="/app/import"
            className="shrink-0 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:border-ember/50"
          >
            Import a recipe
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
          {state.recipes.map((r) => {
            const unresolved = r.source.unmatchedIngredients?.filter((line) => line.trim()) ?? [];
            return (
              <li key={r.id} className="p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.servings} servings · {r.totalTimeMinutes} min · {r.ingredients.length}{" "}
                      matched ingredients · {r.source.extractionMethod} · {Math.round(r.source.confidence * 100)}%
                      confidence
                    </p>
                  </div>
                  {unresolved.length > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1 border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="size-3" /> Needs mapping
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                      <CheckCircle2 className="size-3" /> Plan-ready
                    </span>
                  )}
                </div>

                {unresolved.length > 0 && (
                  <details className="mt-3 border-l-2 border-amber-500/50 pl-3">
                    <summary className="cursor-pointer text-xs font-bold text-amber-700 dark:text-amber-300">
                      {unresolved.length} unresolved ingredient line{unresolved.length === 1 ? "" : "s"}
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {unresolved.map((line, index) => (
                        <li key={`${line}_${index}`}>{line}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-muted-foreground">
                      MealForge will not cost or auto-select this recipe until every required ingredient can be identified safely.
                    </p>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
