import { createServerFn } from "@tanstack/react-start";

const RECIPE_HOSTS = [
  "allrecipes.com",
  "bonappetit.com",
  "budgetbytes.com",
  "cookieandkate.com",
  "delish.com",
  "eatingwell.com",
  "epicurious.com",
  "food.com",
  "foodnetwork.com",
  "minimalistbaker.com",
  "natashaskitchen.com",
  "recipetineats.com",
  "seriouseats.com",
  "simplyrecipes.com",
  "skinnytaste.com",
  "southernliving.com",
  "spendwithpennies.com",
  "tasteofhome.com",
  "tasty.co",
  "thekitchn.com",
] as const;

function allowedUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a valid recipe URL.");
  }
  if (url.protocol !== "https:") throw new Error("Recipe links must use HTTPS.");

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const allowed = RECIPE_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (!allowed) {
    throw new Error(
      "That site is not on MealForge's safe-link list yet. Paste the recipe text instead and it will still import.",
    );
  }
  return url;
}

function isoDurationMinutes(value: unknown): number {
  if (typeof value !== "string") return 0;
  const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
  if (!match) return 0;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  return days * 1440 + hours * 60 + minutes + Math.round(seconds / 60);
}

function typeIncludesRecipe(value: unknown): boolean {
  if (typeof value === "string") return value.toLowerCase() === "recipe";
  if (Array.isArray(value)) return value.some(typeIncludesRecipe);
  return false;
}

function findRecipeNode(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = findRecipeNode(item);
      if (hit) return hit;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeIncludesRecipe(record["@type"])) return record;

  const graph = record["@graph"];
  if (graph) {
    const hit = findRecipeNode(graph);
    if (hit) return hit;
  }
  const mainEntity = record["mainEntity"];
  if (mainEntity) {
    const hit = findRecipeNode(mainEntity);
    if (hit) return hit;
  }
  return null;
}

function instructionLines(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.flatMap(instructionLines);
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  if (typeof record.text === "string" && record.text.trim()) return [record.text.trim()];
  if (record.itemListElement) return instructionLines(record.itemListElement);
  return [];
}

function parseYield(value: unknown): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === "number" && Number.isFinite(candidate))
    return Math.max(1, Math.round(candidate));
  if (typeof candidate === "string") {
    const match = candidate.match(/\d+(?:\.\d+)?/);
    if (match) return Math.max(1, Math.round(Number(match[0])));
  }
  return 4;
}

function extractJsonLdRecipe(html: string) {
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const script of scripts) {
    const raw = script[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const recipe = findRecipeNode(parsed);
      if (!recipe) continue;

      const title = typeof recipe.name === "string" ? recipe.name.trim() : "Imported recipe";
      const ingredients = Array.isArray(recipe.recipeIngredient)
        ? recipe.recipeIngredient.filter((item): item is string => typeof item === "string")
        : [];
      const steps = instructionLines(recipe.recipeInstructions);
      const servings = parseYield(recipe.recipeYield);
      const total =
        isoDurationMinutes(recipe.totalTime) ||
        isoDurationMinutes(recipe.cookTime) + isoDurationMinutes(recipe.prepTime) ||
        35;

      if (ingredients.length === 0) continue;
      return { title, ingredients, steps, servings, totalTimeMinutes: total };
    } catch {
      // A page can contain multiple JSON-LD scripts; skip malformed blocks.
    }
  }
  return null;
}

export const importRecipeUrl = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    const url = data.url?.trim();
    if (!url || url.length > 2000) throw new Error("Enter a valid recipe URL.");
    return { url };
  })
  .handler(async ({ data }) => {
    const requested = allowedUrl(data.url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(requested, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": "MealForge Recipe Import/1.0",
        },
      });
      if (!response.ok) throw new Error(`Recipe site returned ${response.status}.`);

      // Validate redirect destination too.
      allowedUrl(response.url);

      const contentLength = Number(response.headers.get("content-length") ?? 0);
      if (contentLength > 3_000_000)
        throw new Error("That recipe page is too large to import safely.");
      const html = await response.text();
      if (html.length > 3_000_000)
        throw new Error("That recipe page is too large to import safely.");

      const recipe = extractJsonLdRecipe(html);
      if (!recipe) {
        throw new Error(
          "MealForge could not find structured recipe data on that page. Paste the recipe text instead.",
        );
      }

      const rawText = [
        recipe.title,
        `Serves ${recipe.servings} · ${recipe.totalTimeMinutes} minutes`,
        "",
        "Ingredients",
        ...recipe.ingredients,
        "",
        "Instructions",
        ...recipe.steps.map((step, index) => `${index + 1}. ${step}`),
      ].join("\n");

      return {
        rawText,
        sourceUrl: response.url,
        method: "jsonld" as const,
        ingredientLines: recipe.ingredients.length,
        stepLines: recipe.steps.length,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("That recipe site took too long to respond.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  });
