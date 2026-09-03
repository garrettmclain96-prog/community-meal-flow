/**
 * Unit system for the shared food intelligence layer.
 *
 * Everything normalizes to one of three canonical bases:
 *   mass   -> grams (g)
 *   volume -> millilitres (ml)
 *   count  -> each
 *
 * Volume <-> mass conversion is ingredient specific and lives in the
 * ingredient knowledge graph (`gramsPerCup`), not here.
 */

export type Dimension = "mass" | "volume" | "count";

export interface UnitDef {
  id: string;
  dimension: Dimension;
  /** how many canonical base units one of this unit equals */
  base: number;
  label: string;
  plural?: string;
}

export const UNITS: Record<string, UnitDef> = {
  g: { id: "g", dimension: "mass", base: 1, label: "g" },
  kg: { id: "kg", dimension: "mass", base: 1000, label: "kg" },
  oz: { id: "oz", dimension: "mass", base: 28.3495, label: "oz" },
  lb: { id: "lb", dimension: "mass", base: 453.592, label: "lb" },

  ml: { id: "ml", dimension: "volume", base: 1, label: "ml" },
  l: { id: "l", dimension: "volume", base: 1000, label: "l" },
  tsp: { id: "tsp", dimension: "volume", base: 4.92892, label: "tsp" },
  tbsp: { id: "tbsp", dimension: "volume", base: 14.7868, label: "tbsp" },
  cup: { id: "cup", dimension: "volume", base: 236.588, label: "cup", plural: "cups" },
  floz: { id: "floz", dimension: "volume", base: 29.5735, label: "fl oz" },
  pt: { id: "pt", dimension: "volume", base: 473.176, label: "pint", plural: "pints" },
  qt: { id: "qt", dimension: "volume", base: 946.353, label: "quart", plural: "quarts" },
  gal: { id: "gal", dimension: "volume", base: 3785.41, label: "gallon", plural: "gallons" },

  each: { id: "each", dimension: "count", base: 1, label: "", plural: "" },
  clove: { id: "clove", dimension: "count", base: 1, label: "clove", plural: "cloves" },
  bunch: { id: "bunch", dimension: "count", base: 1, label: "bunch", plural: "bunches" },
  can: { id: "can", dimension: "count", base: 1, label: "can", plural: "cans" },
  slice: { id: "slice", dimension: "count", base: 1, label: "slice", plural: "slices" },
};

/** Written forms seen in real recipes, mapped to a unit id. */
const UNIT_ALIASES: Record<string, string> = {
  gram: "g",
  grams: "g",
  gr: "g",
  g: "g",
  kilogram: "kg",
  kilograms: "kg",
  kg: "kg",
  kgs: "kg",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  pound: "lb",
  pounds: "lb",
  lb: "lb",
  lbs: "lb",
  "#": "lb",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  ml: "ml",
  liter: "l",
  liters: "l",
  litre: "l",
  l: "l",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsp: "tsp",
  tsps: "tsp",
  t: "tsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbsp: "tbsp",
  tbs: "tbsp",
  tbsps: "tbsp",
  T: "tbsp",
  cup: "cup",
  cups: "cup",
  c: "cup",
  "fluid ounce": "floz",
  "fluid ounces": "floz",
  floz: "floz",
  "fl oz": "floz",
  "fl. oz.": "floz",
  pint: "pt",
  pints: "pt",
  pt: "pt",
  quart: "qt",
  quarts: "qt",
  qt: "qt",
  gallon: "gal",
  gallons: "gal",
  gal: "gal",
  clove: "clove",
  cloves: "clove",
  bunch: "bunch",
  bunches: "bunch",
  can: "can",
  cans: "can",
  slice: "slice",
  slices: "slice",
  each: "each",
  whole: "each",
  large: "each",
  medium: "each",
  small: "each",
  package: "each",
  pkg: "each",
  head: "each",
  stalk: "each",
};

export function resolveUnit(raw: string | undefined | null): UnitDef | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\.$/, "");
  const id = UNIT_ALIASES[key] ?? UNIT_ALIASES[key.replace(/s$/, "")];
  return id ? (UNITS[id] ?? null) : null;
}

export interface Quantity {
  amount: number;
  unit: string;
}

export function toBase(q: Quantity): { dimension: Dimension; amount: number } | null {
  const u = UNITS[q.unit];
  if (!u) return null;
  return { dimension: u.dimension, amount: q.amount * u.base };
}

/**
 * Convert a quantity to another unit. Cross-dimension conversion requires
 * `gramsPerCup` from the ingredient graph.
 */
export function convert(q: Quantity, targetUnit: string, gramsPerCup?: number): number | null {
  const from = UNITS[q.unit];
  const to = UNITS[targetUnit];
  if (!from || !to) return null;
  if (from.dimension === to.dimension) return (q.amount * from.base) / to.base;
  if (from.dimension === "count" || to.dimension === "count") return null;
  if (!gramsPerCup) return null;

  const gPerMl = gramsPerCup / UNITS.cup!.base;
  if (from.dimension === "volume" && to.dimension === "mass") {
    return (q.amount * from.base * gPerMl) / to.base;
  }
  if (from.dimension === "mass" && to.dimension === "volume") {
    return (q.amount * from.base) / gPerMl / to.base;
  }
  return null;
}

const VULGAR: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

/** Parses "1 1/2", "1½", "0.75", "2-3" (takes the midpoint) into a number. */
export function parseAmount(raw: string): number | null {
  let s = raw.trim();
  if (!s) return null;

  for (const [glyph, value] of Object.entries(VULGAR)) {
    if (s.includes(glyph)) {
      const whole = parseFloat(s.replace(glyph, "").trim());
      return (Number.isFinite(whole) ? whole : 0) + value;
    }
  }

  const range = s.match(/^(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)$/i);
  if (range) return (parseFloat(range[1]!) + parseFloat(range[2]!)) / 2;

  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return parseInt(mixed[1]!, 10) + parseInt(mixed[2]!, 10) / parseInt(mixed[3]!, 10);

  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return parseInt(frac[1]!, 10) / parseInt(frac[2]!, 10);

  s = s.replace(/,/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

const FRACTION_STEPS: Array<[number, string]> = [
  [0, ""],
  [0.125, "⅛"],
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.375, "⅜"],
  [0.5, "½"],
  [0.625, "⅝"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
  [0.875, "⅞"],
  [1, ""],
];

/** Human-readable quantity, e.g. 1.5 cup -> "1½ cups". */
export function formatQuantity(q: Quantity): string {
  const u = UNITS[q.unit];
  const label = u ? (q.amount === 1 ? u.label : (u.plural ?? u.label)) : q.unit;

  let numeric: string;
  if (u?.dimension === "mass" || u?.dimension === "volume" ? q.amount >= 10 : false) {
    numeric = String(Math.round(q.amount));
  } else {
    const whole = Math.floor(q.amount);
    const rest = q.amount - whole;
    let best = FRACTION_STEPS[0]!;
    for (const step of FRACTION_STEPS) {
      if (Math.abs(step[0] - rest) < Math.abs(best[0] - rest)) best = step;
    }
    if (best[0] === 1) numeric = String(whole + 1);
    else if (!best[1])
      numeric = whole > 0 ? String(whole) : (Math.round(q.amount * 100) / 100).toString();
    else numeric = whole > 0 ? `${whole}${best[1]}` : best[1];
  }

  return label ? `${numeric} ${label}` : numeric;
}
