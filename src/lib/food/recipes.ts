import type { Recipe, RecipeIngredient } from "./types";

/**
 * Seed recipe library. Every recipe is normalized against the ingredient
 * knowledge graph, and carries a source record with extraction method and
 * confidence — exactly like an imported recipe does.
 */

function ri(ingredientId: string, amount: number, unit: string, extra?: Partial<RecipeIngredient>): RecipeIngredient {
  return { ingredientId, quantity: { amount, unit }, ...extra };
}

function seed(
  id: string,
  title: string,
  servings: number,
  totalTimeMinutes: number,
  tags: string[],
  equipment: string[],
  ingredients: RecipeIngredient[],
  steps: string[],
): Recipe {
  return {
    id,
    title,
    servings,
    totalTimeMinutes,
    tags,
    equipment,
    ingredients,
    steps,
    source: {
      kind: "manual",
      extractionMethod: "manual",
      confidence: 1,
      importedAt: "2026-01-01T00:00:00.000Z",
    },
  };
}

export const SEED_RECIPES: Recipe[] = [
  seed("sheet_pan_chicken", "Sheet-pan chicken thighs with potatoes", 4, 45,
    ["dinner", "one-pan", "budget"], ["oven", "sheet pan"],
    [
      ri("chicken_thigh", 2, "lb"), ri("potato", 1.5, "lb"), ri("onion", 1, "each"),
      ri("olive_oil", 2, "tbsp"), ri("paprika", 2, "tsp"), ri("garlic", 4, "clove"),
      ri("salt", 1, "tsp"), ri("black_pepper", 0.5, "tsp"),
    ],
    [
      "Heat the oven to 425°F.",
      "Toss potatoes, onion and garlic with oil, paprika, salt and pepper on a sheet pan.",
      "Nestle the chicken thighs on top, skin side up, and season.",
      "Roast 35–40 minutes until the chicken reaches 175°F and the potatoes are crisp.",
    ]),

  seed("black_bean_tacos", "Black bean and sweet potato tacos", 4, 30,
    ["dinner", "vegetarian", "fast", "budget"], ["skillet"],
    [
      ri("sweet_potato", 1.5, "lb"), ri("black_beans", 2, "can"), ri("corn_tortillas", 12, "each"),
      ri("cumin", 2, "tsp"), ri("chili_powder", 2, "tsp"), ri("olive_oil", 2, "tbsp"),
      ri("lime", 2, "each"), ri("cilantro", 0.5, "bunch", { optional: true }), ri("onion", 1, "each"),
    ],
    [
      "Dice the sweet potato and cook in oil over medium-high until tender, 12 minutes.",
      "Add onion, cumin and chili powder; cook 4 minutes.",
      "Stir in drained beans and warm through.",
      "Warm the tortillas and fill; finish with lime and cilantro.",
    ]),

  seed("red_lentil_curry", "Red lentil coconut curry", 4, 35,
    ["dinner", "vegan", "budget", "batch"], ["pot"],
    [
      ri("lentils", 1.5, "cup"), ri("coconut_milk", 1, "can"), ri("canned_tomatoes", 1, "can"),
      ri("onion", 1, "each"), ri("garlic", 3, "clove"), ri("ginger", 1, "tbsp"),
      ri("curry_powder", 2, "tbsp"), ri("veg_broth", 3, "cup"), ri("rice", 2, "cup"), ri("spinach", 4, "oz"),
    ],
    [
      "Sweat onion, garlic and ginger in oil until soft.",
      "Add curry powder and toast 1 minute.",
      "Add lentils, tomatoes, coconut milk and broth; simmer 22 minutes.",
      "Fold in spinach and serve over rice.",
    ]),

  seed("beef_chili", "Weeknight beef chili", 6, 50,
    ["dinner", "batch", "freezer"], ["pot"],
    [
      ri("ground_beef", 1.5, "lb"), ri("pinto_beans", 2, "can"), ri("canned_tomatoes", 2, "can"),
      ri("onion", 1, "each"), ri("bell_pepper", 2, "each"), ri("garlic", 4, "clove"),
      ri("chili_powder", 3, "tbsp"), ri("cumin", 1, "tbsp"), ri("chicken_broth", 2, "cup"),
    ],
    [
      "Brown the beef in a heavy pot; drain excess fat.",
      "Add onion, pepper and garlic; cook 6 minutes.",
      "Stir in spices, tomatoes, beans and broth.",
      "Simmer uncovered 30 minutes, stirring occasionally.",
    ]),

  seed("chicken_fried_rice", "Chicken fried rice", 4, 25,
    ["dinner", "fast", "leftovers"], ["wok", "skillet"],
    [
      ri("chicken_breast", 1, "lb"), ri("rice", 3, "cup"), ri("eggs", 3, "each"),
      ri("frozen_peas", 1.5, "cup"), ri("carrot", 2, "each"), ri("scallion", 4, "each"),
      ri("soy_sauce", 3, "tbsp"), ri("vegetable_oil", 2, "tbsp"), ri("garlic", 3, "clove"),
    ],
    [
      "Cook the rice ahead and chill it — day-old rice fries best.",
      "Sear diced chicken in a hot wok; remove.",
      "Scramble the eggs, add carrot, peas, garlic and rice.",
      "Return the chicken, add soy sauce, toss hard for 3 minutes, finish with scallion.",
    ]),

  seed("pasta_pomodoro", "Pasta pomodoro", 4, 25,
    ["dinner", "vegetarian", "fast", "budget"], ["pot", "skillet"],
    [
      ri("pasta", 1, "lb"), ri("canned_tomatoes", 2, "can"), ri("garlic", 5, "clove"),
      ri("olive_oil", 3, "tbsp"), ri("parmesan", 3, "oz"), ri("salt", 1, "tsp"),
    ],
    [
      "Boil the pasta one minute short of the package time; save a cup of water.",
      "Sizzle sliced garlic in olive oil, add tomatoes, simmer 12 minutes.",
      "Toss the pasta in the sauce with the reserved water.",
      "Finish off heat with parmesan.",
    ]),

  seed("turkey_taco_skillet", "Ground turkey taco skillet", 4, 30,
    ["dinner", "one-pan", "fast"], ["skillet"],
    [
      ri("ground_turkey", 1, "lb"), ri("rice", 1.5, "cup"), ri("black_beans", 1, "can"),
      ri("frozen_corn", 1.5, "cup"), ri("canned_tomatoes", 1, "can"), ri("chili_powder", 2, "tbsp"),
      ri("cheddar", 4, "oz"), ri("chicken_broth", 2, "cup"), ri("onion", 1, "each"),
    ],
    [
      "Brown the turkey with the onion.",
      "Add spices, rice, beans, corn, tomatoes and broth.",
      "Cover and simmer 20 minutes until the rice is tender.",
      "Top with cheddar, cover off heat until melted.",
    ]),

  seed("tofu_stirfry", "Ginger tofu and broccoli stir-fry", 4, 30,
    ["dinner", "vegan", "fast"], ["wok", "skillet"],
    [
      ri("tofu", 28, "oz"), ri("broccoli", 1.5, "lb"), ri("soy_sauce", 4, "tbsp"),
      ri("ginger", 2, "tbsp"), ri("garlic", 4, "clove"), ri("rice", 2, "cup"),
      ri("vegetable_oil", 2, "tbsp"), ri("scallion", 3, "each"),
    ],
    [
      "Press and cube the tofu; sear until golden on most sides.",
      "Add broccoli with a splash of water and cover 3 minutes.",
      "Add garlic and ginger, then soy sauce; toss to glaze.",
      "Serve over rice with scallions.",
    ]),

  seed("salmon_roast", "Roast salmon with lemon potatoes", 4, 35,
    ["dinner", "pescatarian"], ["oven", "sheet pan"],
    [
      ri("salmon", 1.5, "lb"), ri("potato", 1.5, "lb"), ri("lemon", 2, "each"),
      ri("olive_oil", 3, "tbsp"), ri("garlic", 3, "clove"), ri("oregano", 1, "tbsp"),
    ],
    [
      "Roast sliced potatoes with oil, garlic and oregano at 425°F for 25 minutes.",
      "Add the salmon and lemon slices to the pan.",
      "Roast 10–12 minutes more until the salmon flakes.",
    ]),

  seed("chickpea_shakshuka", "Chickpea shakshuka", 4, 30,
    ["dinner", "vegetarian", "budget", "fast"], ["skillet"],
    [
      ri("chickpeas", 2, "can"), ri("canned_tomatoes", 2, "can"), ri("eggs", 6, "each"),
      ri("bell_pepper", 2, "each"), ri("onion", 1, "each"), ri("cumin", 2, "tsp"),
      ri("paprika", 2, "tsp"), ri("bread", 6, "slice"), ri("olive_oil", 2, "tbsp"),
    ],
    [
      "Soften onion and pepper in oil, add spices.",
      "Add tomatoes and chickpeas; simmer 12 minutes until thick.",
      "Make wells, crack in the eggs, cover and cook 7 minutes.",
      "Serve with toasted bread.",
    ]),

  seed("pork_carnitas", "Slow pork carnitas", 6, 200,
    ["dinner", "batch", "weekend"], ["oven", "dutch oven"],
    [
      ri("pork_shoulder", 4, "lb"), ri("onion", 2, "each"), ri("garlic", 6, "clove"),
      ri("cumin", 1, "tbsp"), ri("oregano", 1, "tbsp"), ri("lime", 3, "each"),
      ri("corn_tortillas", 18, "each"), ri("chicken_broth", 2, "cup"),
    ],
    [
      "Season the pork heavily and sear on all sides.",
      "Add aromatics and broth, cover, and braise at 300°F for 3 hours.",
      "Shred, then crisp under the broiler.",
      "Serve in warm tortillas with lime.",
    ]),

  seed("veggie_soup", "Pantry vegetable and bean soup", 6, 40,
    ["dinner", "vegan", "budget", "batch", "freezer"], ["pot"],
    [
      ri("carrot", 3, "each"), ri("celery", 4, "each"), ri("onion", 1, "each"),
      ri("potato", 1, "lb"), ri("cabbage", 0.5, "each"), ri("canned_tomatoes", 1, "can"),
      ri("pinto_beans", 2, "can"), ri("veg_broth", 8, "cup"), ri("olive_oil", 2, "tbsp"),
    ],
    [
      "Sweat the onion, carrot and celery in oil for 8 minutes.",
      "Add potato, cabbage, tomatoes, beans and broth.",
      "Simmer 25 minutes; season aggressively.",
    ]),

  seed("mushroom_pasta", "Mushroom and spinach pasta", 4, 30,
    ["dinner", "vegetarian", "fast"], ["pot", "skillet"],
    [
      ri("pasta", 1, "lb"), ri("mushroom", 1, "lb"), ri("spinach", 5, "oz"),
      ri("garlic", 4, "clove"), ri("butter", 3, "tbsp"), ri("parmesan", 3, "oz"),
      ri("olive_oil", 2, "tbsp"),
    ],
    [
      "Boil the pasta; reserve a cup of water.",
      "Brown the mushrooms hard in oil, then add butter and garlic.",
      "Wilt the spinach, add pasta and water, toss with parmesan.",
    ]),

  seed("egg_fried_potatoes", "Skillet potatoes, eggs and greens", 4, 30,
    ["dinner", "vegetarian", "budget", "fast"], ["skillet"],
    [
      ri("potato", 2, "lb"), ri("eggs", 8, "each"), ri("spinach", 5, "oz"),
      ri("onion", 1, "each"), ri("olive_oil", 3, "tbsp"), ri("paprika", 2, "tsp"),
      ri("cheddar", 3, "oz", { optional: true }),
    ],
    [
      "Parboil diced potatoes 6 minutes, drain well.",
      "Crisp them in a hot skillet with oil, onion and paprika.",
      "Wilt in the spinach, make wells and fry the eggs on top.",
    ]),
];

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(
  SEED_RECIPES.map((r) => [r.id, r]),
);
