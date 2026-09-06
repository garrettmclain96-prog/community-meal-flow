import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { useMemo, useState } from "react";

import { importRecipeUrl } from "@/lib/food/import.functions";
import { INGREDIENT_BY_ID } from "@/lib/food/ingredients";
import { parsePastedRecipe, recipeFromPaste } from "@/lib/food/parse";
import { useMealForge } from "@/lib/food/store";
import type { ExtractionMethod } from "@/lib/food/types";
import { formatQuantity } from "@/lib/food/units";

export const Route = createFileRoute("/app/import")({
  head: () => ({
    meta: [
      { title: "Import a Recipe — MealForge" },
      {
        name: "description",
        content:
          "Import a supported recipe link or paste recipe text. MealForge normalizes it against the canonical ingredient graph and preserves source provenance.",
      },
      { property: "og:title", content: "Import a Recipe — MealForge" },
      {
        property: "og:description",
        content:
          "Import a recipe link or paste text; MealForge normalizes it against the ingredient graph with source kept intact.",
      },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  const { addRecipe } = useMealForge();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceMethod, setSourceMethod] = useState<ExtractionMethod | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const parsed = useMemo(() => (text.trim().length > 20 ? parsePastedRecipe(text) : null), [text]);

  const importLink = async () => {
    if (!url.trim()) return;
    setUrlLoading(true);
    setUrlError(null);
    try {
      const result = await importRecipeUrl({ data: { url: url.trim() } });
      setText(result.rawText);
      setSourceUrl(result.sourceUrl);
      setSourceMethod(result.method);
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : "That recipe link could not be imported.");
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Import a recipe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start with a supported recipe link or paste the recipe text yourself. MealForge keeps the
          source, normalizes known ingredients, and shows anything it could not match before saving.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <div>
          <p className="text-sm font-bold">Import from a recipe link</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Works with common recipe publishers that expose Schema.org Recipe data. Unsupported sites
            can still be imported with the paste box below.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void importLink();
              }
            }}
            placeholder="https://www.allrecipes.com/..."
            className="field-control min-w-0 flex-1"
          />
          <button
            type="button"
            disabled={!url.trim() || urlLoading}
            onClick={() => void importLink()}
            className="button-primary shrink-0 disabled:opacity-40"
          >
            <Link2 className="size-4" /> {urlLoading ? "Reading…" : "Import link"}
          </button>
        </div>
        {urlError && <p className="text-sm text-ember-text">{urlError}</p>}
        {sourceUrl && (
          <p className="text-xs text-primary">
            Link imported. Review the normalized recipe below before saving.
          </p>
        )}
      </section>

      <div>
        <p className="mb-2 text-sm font-bold">Recipe text</p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (!e.target.value.trim()) {
              setSourceUrl(null);
              setSourceMethod(null);
            }
          }}
          rows={12}
          placeholder={
            "Skillet chicken and rice\nServes 4 · 35 minutes\n\nIngredients\n1.5 lb chicken thighs\n1 cup white rice\n2 tbsp olive oil\n\nInstructions\nSear the chicken…"
          }
          className="w-full rounded-lg border border-border bg-surface p-4 font-mono text-xs"
        />
      </div>

      {parsed && (
        <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <h2 className="font-display text-xl font-bold">{parsed.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {parsed.servings} servings · {parsed.totalTimeMinutes} min · {sourceMethod ?? parsed.method} ·{" "}
              {Math.round(parsed.confidence * 100)}% normalization confidence
            </p>
            {sourceUrl && (
              <p className="mt-1 truncate text-xs text-muted-foreground" title={sourceUrl}>
                Source: {sourceUrl}
              </p>
            )}
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
                Unmatched lines remain in the source record rather than being silently discarded.
                They are not costed until that ingredient exists in the canonical graph.
              </p>
            </div>
          )}

          <button
            disabled={parsed.ingredients.length === 0}
            onClick={() => {
              const recipe = recipeFromPaste(parsed, text);
              if (sourceUrl) {
                recipe.source = {
                  ...recipe.source,
                  kind: "url",
                  url: sourceUrl,
                  extractionMethod: sourceMethod ?? "jsonld",
                };
              }
              addRecipe(recipe);
              void navigate({ to: "/app/kitchen" });
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
