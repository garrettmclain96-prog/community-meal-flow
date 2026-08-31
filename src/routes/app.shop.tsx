import { createFileRoute, Link } from "@tanstack/react-router";

import { PROVENANCE_LABEL, STORE_BY_ID } from "@/lib/food/pricing";
import { useMealForge } from "@/lib/food/store";

export const Route = createFileRoute("/app/shop")({
  head: () => ({
    meta: [
      { title: "Grocery List — MealForge" },
      {
        name: "description",
        content:
          "One consolidated grocery list per plan: pantry-offset, rounded to purchasable package sizes, grouped by aisle, with price provenance on every line.",
      },
      { property: "og:title", content: "Grocery List — MealForge" },
      {
        property: "og:description",
        content: "Pantry-offset, package-rounded and aisle-grouped, with provenance on every price.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { state, ready, groceryList, stockRemainders, toggleChecked } = useMealForge();

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!state.plan || !groceryList) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h1 className="font-display text-2xl font-bold">No list yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The grocery list is generated from your weekly plan, so build the plan first.
        </p>
        <Link
          to="/app/plan"
          className="mt-4 inline-flex rounded-sm bg-ember px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Go to Plan
        </Link>
      </div>
    );
  }

  const list = groceryList;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Grocery list</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {STORE_BY_ID[list.storeId]?.name} · {list.lines.length} items · total $
          {list.total.toFixed(2)}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Box label="Total" value={`$${list.total.toFixed(2)}`} />
        <Box label="Saved from pantry" value={`$${list.pantrySavings.toFixed(2)}`} />
        <Box label="Leftover value" value={`$${list.remainderValue.toFixed(2)}`} />
      </div>

      {list.byAisle.map((group) => (
        <section key={group.aisle}>
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {group.aisle} · ${group.subtotal.toFixed(2)}
          </h2>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
            {group.lines.map((line) => {
              const checked = state.checked.includes(line.ingredientId);
              return (
                <li key={line.ingredientId}>
                  <label className="flex cursor-pointer items-start gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChecked(line.ingredientId)}
                      className="mt-1 size-4 accent-[var(--ember-glow)]"
                    />
                    <span className="flex-1">
                      <span
                        className={`block font-medium ${checked ? "line-through opacity-60" : ""}`}
                      >
                        {line.packages} × {line.packageLabel} {line.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        ${line.cost.toFixed(2)} · {PROVENANCE_LABEL[line.provenance]} · for{" "}
                        {line.usedIn.join(", ")}
                        {line.remainderBase > 0.01 &&
                          ` · ${line.remainderBase.toFixed(1)} ${line.unit} left over`}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-semibold">After you shop</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Package rounding leaves ${list.remainderValue.toFixed(2)} of food behind. Bank it into the
          pantry so next week's plan spends it instead of buying it again.
        </p>
        <button
          onClick={stockRemainders}
          className="mt-3 rounded-sm border border-border px-4 py-2 text-sm font-semibold hover:border-ember/50"
        >
          Add leftovers to pantry
        </button>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
