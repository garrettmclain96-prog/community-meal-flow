import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { INGREDIENT_BY_ID } from "@/lib/food/ingredients";
import { parsePastedRecipe, recipeFromPaste } from "@/lib/food/parse";
import { useMealForge } from "@/lib/food/store";
import { formatQuantity } from "@/lib/food/units";

export const Route = createFileRoute("/app/import")({
  head: () => ({
    meta: [
      { title: "Import a Recipe — MealForge" },
      {
        name: "description",
        content:
          "Paste any recipe and MealForge normalizes it against the canonical ingredient graph, keeping the raw source, extraction method and confidence.",
      },
      { property: "og:title", content: "Import a Recipe — MealForge" },
      {
        property: "og:description",
        content: "Paste a recipe; it is normalized against the ingredient graph with source kept intact.",
      },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  const { addRecipe } = useMealForge();
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const parsed = useMemo(() => (text.trim().length > 20 ? parsePastedRecipe(text) : null), [text]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Import a recipe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste the recipe text. Parsing is deterministic — quantities, units and ingredient
          identity are resolved against the canonical graph, and the raw text is stored alongside
          the normalized record.
        </p>
      </header>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder={"Skillet chicken and rice\nServes 4 · 35 minutes\n\nIngredients\n1.5 lb chicken thighs\n1 cup white rice\n2 tbsp olive oil\n\nInstructions\nSear the chicken…"}
        className="w-full rounded-lg border border-border bg-surface p-4 font-mono text-xs"
      />

      {parsed && (
        <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <h2 className="font-display text-xl font-bold">{parsed.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {parsed.servings} servings · {parsed.totalTimeMinutes} min · {parsed.method} ·{" "}
              {Math.round(parsed.confidence * 100)}% confidence
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Matched ingredients · {parsed.ingredients.length}
            </p>
            <ul className="mt-1 space-y-1 text-sm">
              {parsed.ingredients.map((ing, i) => (
                <li key={`${ing.ingredientId}_${i}`} className="flex justify-between gap-3">
                  <span>{INGREDIENT_BY_ID[ing.ingredientId]?.name ?? ing.ingredientId}</span>
                  <span className="text-muted-foreground">{formatQuantity(ing.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>

          {parsed.unmatched.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-ember-text">
                Unmatched lines · {parsed.unmatched.length}
              </p>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                {parsed.unmatched.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted-foreground">
                Unmatched lines are kept in the source record rather than silently dropped. They
                are not costed until the ingredient exists in the graph.
              </p>
            </div>
          )}

          <button
            disabled={parsed.ingredients.length === 0}
            onClick={() => {
              addRecipe(recipeFromPaste(parsed, text));
              navigate({ to: "/app/kitchen" });
            }}
            className="w-full rounded-sm bg-ember px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Save to my recipe library
          </button>
        </section>
      )}
    </div>
  );
}
