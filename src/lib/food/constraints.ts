import { INGREDIENT_BY_ID } from "./ingredients";
import type { RecipeIngredient } from "./types";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function phraseMatch(haystack: string, needle: string) {
  const h = ` ${normalize(haystack)} `;
  const n = normalize(needle);
  if (!n) return false;
  return h.includes(` ${n} `);
}

/**
 * Matches a user-defined food exclusion against the ingredient metadata and
 * the verbatim imported ingredient line when available.
 *
 * This is intentionally phrase-aware rather than arbitrary substring matching
 * to avoid false positives such as "nut" matching unrelated word fragments.
 */
export function customConstraintMatch(item: RecipeIngredient, value: string): boolean {
  const ing = INGREDIENT_BY_ID[item.ingredientId];
  if (!ing) return phraseMatch(item.raw ?? "", value);

  const candidates = [ing.name, ing.id, ...ing.aliases, item.raw ?? ""];
  return candidates.some((candidate) => phraseMatch(candidate, value));
}

export function findCustomConstraint(
  item: RecipeIngredient,
  values: string[],
): string | null {
  for (const value of values) {
    if (customConstraintMatch(item, value)) return value;
  }
  return null;
}
