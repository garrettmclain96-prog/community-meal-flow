import { createFileRoute, Link } from "@tanstack/react-router";

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
        <h1 className="font-display text-3xl font-bold tracking-tight">Kitchen</h1>
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
                  className="text-xs text-muted-foreground hover:text-ember-text"
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
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Recipes · {state.recipes.length}
          </h2>
          <Link
            to="/app/import"
            className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:border-ember/50"
          >
            Import a recipe
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
          {state.recipes.map((r) => (
            <li key={r.id} className="p-3 text-sm">
              <p className="font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">
                {r.servings} servings · {r.totalTimeMinutes} min · {r.ingredients.length}{" "}
                ingredients · {r.source.extractionMethod} ·{" "}
                {Math.round(r.source.confidence * 100)}% confidence
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
