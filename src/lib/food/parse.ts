import { matchIngredient } from "./ingredients";
import type { ExtractionMethod, Recipe, RecipeIngredient } from "./types";
import { parseAmount, resolveUnit } from "./units";

/**
 * Deterministic recipe ingestion (v1): manual entry and pasted text.
 *
 * The raw source is always preserved alongside the normalized record, and
 * every import records its extraction method plus a confidence score.
 * URL / JSON-LD / recipe-scrapers providers slot in ahead of this parser.
 */

const AMOUNT_RE = /^\s*([\d¼½¾⅐⅓⅔⅛⅜⅝⅞./\s-]+?)\s+(.*)$/;

export interface ParsedLine {
  raw: string;
  parsed: RecipeIngredient | null;
  confidence: number;
}

export function parseIngredientLine(raw: string): ParsedLine {
  const line = raw.replace(/^[-*•\u2022]\s*/, "").trim();
  if (!line) return { raw, parsed: null, confidence: 0 };

  let amount: number | null = null;
  let rest = line;

  const m = line.match(AMOUNT_RE);
  if (m) {
    const n = parseAmount(m[1]!);
    if (n !== null) {
      amount = n;
      rest = m[2]!;
    }
  }

  const unitToken = rest.split(/\s+/)[0] ?? "";
  const unit = resolveUnit(unitToken);
  if (unit) rest = rest.slice(unitToken.length).trim();

  const match = matchIngredient(rest || line);
  if (!match) return { raw: line, parsed: null, confidence: 0 };

  const optional = /\boptional\b/i.test(line);
  const confidence = Math.min(
    1,
    match.confidence * (amount === null ? 0.7 : 1) * (unit ? 1 : 0.85),
  );

  return {
    raw: line,
    confidence,
    parsed: {
      ingredientId: match.ingredientId,
      quantity: { amount: amount ?? 1, unit: unit?.id ?? "each" },
      raw: line,
      optional,
    },
  };
}

export interface PasteParseResult {
  title: string;
  servings: number;
  totalTimeMinutes: number;
  ingredients: RecipeIngredient[];
  unmatched: string[];
  steps: string[];
  confidence: number;
  method: ExtractionMethod;
}

const SECTION_ING = /^\s*(ingredients?)\s*:?\s*$/i;
const SECTION_STEPS = /^\s*(instructions?|directions?|method|steps?)\s*:?\s*$/i;

export function parsePastedRecipe(text: string): PasteParseResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);

  let title = nonEmpty[0] ?? "Untitled recipe";
  const servingsMatch = text.match(/(?:serves|servings|yield[s]?)\D{0,10}(\d+)/i);
  const timeMatch = text.match(/(\d+)\s*(?:minutes|mins?|min)\b/i);
  const hourMatch = text.match(/(\d+)\s*(?:hours?|hrs?)\b/i);

  let mode: "none" | "ing" | "steps" = "none";
  const ingLines: string[] = [];
  const stepLines: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    if (SECTION_ING.test(line)) { mode = "ing"; continue; }
    if (SECTION_STEPS.test(line)) { mode = "steps"; continue; }
    if (mode === "ing") ingLines.push(line);
    else if (mode === "steps") stepLines.push(line);
  }

  // No explicit sections: quantity-leading lines are ingredients, prose is steps.
  if (mode === "none") {
    for (const line of nonEmpty.slice(1)) {
      if (/^[\d¼½¾⅓⅔⅛-]/.test(line) || /^[-*•]/.test(line)) ingLines.push(line);
      else stepLines.push(line);
    }
  } else if (title === "Ingredients" || SECTION_ING.test(title)) {
    title = "Untitled recipe";
  }

  const parsed = ingLines.map(parseIngredientLine);
  const ingredients = parsed.filter((p) => p.parsed).map((p) => p.parsed!);
  const unmatched = parsed.filter((p) => !p.parsed).map((p) => p.raw);

  const avg =
    parsed.length === 0 ? 0 : parsed.reduce((s, p) => s + p.confidence, 0) / parsed.length;

  return {
    title: title.replace(/^#+\s*/, "").slice(0, 120),
    servings: servingsMatch ? parseInt(servingsMatch[1]!, 10) : 4,
    totalTimeMinutes:
      (hourMatch ? parseInt(hourMatch[1]!, 10) * 60 : 0) +
      (timeMatch ? parseInt(timeMatch[1]!, 10) : hourMatch ? 0 : 35),
    ingredients,
    unmatched,
    steps: stepLines.map((s) => s.replace(/^\d+[.)]\s*/, "")).filter((s) => s.length > 3),
    confidence: Math.round(avg * 100) / 100,
    method: "paste_deterministic",
  };
}

export function recipeFromPaste(result: PasteParseResult, rawText: string): Recipe {
  return {
    id: `imported_${Date.now().toString(36)}`,
    title: result.title,
    servings: result.servings,
    totalTimeMinutes: result.totalTimeMinutes,
    steps: result.steps,
    ingredients: result.ingredients,
    tags: ["imported"],
    equipment: [],
    source: {
      kind: "paste",
      raw: rawText,
      extractionMethod: result.method,
      confidence: result.confidence,
      importedAt: new Date().toISOString(),
    },
  };
}
