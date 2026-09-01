import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { INGREDIENTS, INGREDIENT_BY_ID, matchIngredient } from "@/lib/food/ingredients";
import { useMealForge } from "@/lib/food/store";
import { UNITS, formatQuantity } from "@/lib/food/units";

export const Route = createFileRoute("/app/pantry")({
  head: () => ({
    meta: [
      { title: "Pantry — MealForge" },
      {
        name: "description",
        content:
          "Track what you already own against canonical ingredients so the planner spends your pantry before it spends your budget.",
      },
      { property: "og:title", content: "Pantry — MealForge" },
      {
        property: "og:description",
        content: "Track stock against canonical ingredients and cut it out of next week's list.",
      },
    ],
  }),
  component: PantryPage,
});

const UNIT_OPTIONS = Object.keys(UNITS);

function PantryPage() {
  const { state, ready, addPantryItem, removePantryItem } = useMealForge();
  const [query, setQuery] = useState("");
  const [ingredientId, setIngredientId] = useState<string>("");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState("lb");
  const [expires, setExpires] = useState("");

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const suggestions = query.trim()
    ? INGREDIENTS.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.aliases.some((a) => a.includes(query.toLowerCase())),
      ).slice(0, 8)
    : [];

  const chosen = ingredientId ? INGREDIENT_BY_ID[ingredientId] : null;

  const add = () => {
    const id = ingredientId || matchIngredient(query)?.ingredientId;
    const qty = Number(amount);
    if (!id || !Number.isFinite(qty) || qty <= 0) return;
    addPantryItem({
      id: `p_${Date.now().toString(36)}`,
      ingredientId: id,
      quantity: { amount: qty, unit },
      origin: "manual",
      addedAt: new Date().toISOString(),
      ...(expires ? { expiresAt: new Date(expires).toISOString() } : {}),
    });
    setQuery("");
    setIngredientId("");
    setAmount("1");
    setExpires("");
  };

  const now = Date.now();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Pantry</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything here is subtracted from the grocery list before packages are priced.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <input
          value={chosen ? chosen.name : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIngredientId("");
          }}
          placeholder="Search ingredients — rice, chicken thighs, olive oil…"
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        {suggestions.length > 0 && !chosen && (
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    setIngredientId(s.id);
                    setUnit(s.packages[0]?.unit ?? "each");
                  }}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs hover:border-ember/50"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="number"
            min={0}
            step={0.25}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={add}
          disabled={!ingredientId && !matchIngredient(query)}
          className="w-full rounded-sm bg-ember px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          Add to pantry
        </button>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
          In stock · {state.pantry.length}
        </h2>
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
          {state.pantry.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">Nothing stocked yet.</li>
          )}
          {state.pantry.map((item) => {
            const expired = item.expiresAt ? Date.parse(item.expiresAt) < now : false;
            return (
              <li key={item.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span>
                  <span className="font-medium">
                    {INGREDIENT_BY_ID[item.ingredientId]?.name ?? item.ingredientId}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatQuantity(item.quantity)} ·{" "}
                    {item.origin === "package_remainder" ? "package leftover" : item.origin}
                    {item.expiresAt &&
                      ` · ${expired ? "expired" : "use by"} ${new Date(item.expiresAt).toLocaleDateString()}`}
                  </span>
                </span>
                <button
                  onClick={() => removePantryItem(item.id)}
                  className="text-xs text-muted-foreground hover:text-ember-text"
                >
                  {expired ? "Discard" : "Use up"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
