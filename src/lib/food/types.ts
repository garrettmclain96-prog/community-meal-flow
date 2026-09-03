import type { Quantity } from "./units";

export type Allergen =
  "milk" | "egg" | "peanut" | "tree_nut" | "soy" | "wheat" | "fish" | "shellfish" | "sesame";

export type DietTag =
  | "meat"
  | "poultry"
  | "pork"
  | "beef"
  | "fish"
  | "shellfish"
  | "dairy"
  | "egg"
  | "gluten"
  | "alcohol";

export type StorageType = "pantry" | "fridge" | "freezer";

export type IngredientCategory =
  "produce" | "protein" | "dairy" | "grain" | "pantry" | "spice" | "frozen" | "bakery";

export interface PackageSize {
  /** purchasable amount, e.g. 16 oz */
  size: number;
  unit: string;
  label: string;
  /** ESTIMATED national baseline in USD; providers override with real data */
  baselinePrice: number;
}

export interface NutritionPer100g {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  storage: StorageType;
  aliases: string[];
  /** enables volume <-> mass conversion for this ingredient */
  gramsPerCup?: number;
  /** grams for one "each" where the ingredient is countable */
  gramsEach?: number;
  packages: PackageSize[];
  nutrition?: NutritionPer100g;
  allergens: Allergen[];
  diet: DietTag[];
  substitutes?: string[];
  /** shopping-aisle grouping for the consolidated grocery list */
  aisle: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: Quantity;
  /** verbatim line from the source, preserved for auditability */
  raw?: string;
  optional?: boolean;
  note?: string;
}

export type ExtractionMethod =
  | "manual"
  | "paste_deterministic"
  | "jsonld"
  | "html_heuristic"
  | "recipe_scrapers"
  | "ai_normalized";

export interface RecipeSource {
  kind: "manual" | "url" | "paste" | "image" | "pdf";
  url?: string;
  /** raw payload exactly as received — never discarded */
  raw?: string;
  extractionMethod: ExtractionMethod;
  /** 0–1 confidence in the normalization */
  confidence: number;
  importedAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings: number;
  totalTimeMinutes: number;
  steps: string[];
  ingredients: RecipeIngredient[];
  tags: string[];
  equipment: string[];
  source: RecipeSource;
}

export interface HouseholdMember {
  id: string;
  name: string;
  ageGroup: "adult" | "teen" | "child";
  /** portion multiplier relative to one adult serving */
  appetite: number;
}

export interface Household {
  id: string;
  name: string;
  members: HouseholdMember[];
  /** weekly grocery budget in USD */
  weeklyBudget: number;
  dinnersPerWeek: number;
  dietaryPreferences: string[];
  avoidTags: DietTag[];
  allergies: Allergen[];
  equipment: string[];
  storeIds: string[];
  maxCookMinutes: number;
  createdAt: string;
}

export interface PantryItem {
  id: string;
  ingredientId: string;
  quantity: Quantity;
  /** where the stock came from — leftovers from package rounding are tracked */
  origin: "manual" | "package_remainder" | "receipt";
  addedAt: string;
  expiresAt?: string;
}

export interface Store {
  id: string;
  name: string;
  banner: string;
  region: string;
}

export type PriceProvenance = "VERIFIED_LIVE" | "RECENT_OBSERVED" | "ESTIMATED";

export interface PriceQuote {
  ingredientId: string;
  storeId: string;
  pkg: PackageSize;
  price: number;
  provenance: PriceProvenance;
  observedAt?: string;
  providerId: string;
}
