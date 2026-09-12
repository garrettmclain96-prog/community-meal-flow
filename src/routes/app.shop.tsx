import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

import { planRemainderPrefix } from "@/lib/food/grocery";
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
        content:
          "Pantry-offset, package-rounded and aisle-grouped, with provenance on every price.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { state, ready, groceryList, stockRemainders, toggleChecked, addPriceObservation } =
    useMealForge();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");

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
  const checkedCount = list.lines.filter((line) =>
    state.checked.includes(line.ingredientId),
  ).length;
  const bankPrefix = planRemainderPrefix(state.plan.generatedAt);
  const leftoversBanked = state.pantry.some((item) => item.id.startsWith(bankPrefix));

  const startPriceEdit = (ingredientId: string, unitPrice: number) => {
    setEditingId(ingredientId);
    setPriceDraft(unitPrice.toFixed(2));
  };

  const savePrice = (ingredientId: string, packageLabel: string) => {
    const price = Number(priceDraft);
    if (!Number.isFinite(price) || price <= 0) return;
    addPriceObservation({
      ingredientId,
      storeId: list.storeId,
      packageLabel,
      price: Math.round(price * 100) / 100,
      observedAt: new Date().toISOString(),
    });
    setEditingId(null);
    setPriceDraft("");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Grocery list</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {STORE_BY_ID[list.storeId]?.name} · {list.lines.length} items · total $
          {list.total.toFixed(2)}
        </p>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {checkedCount} of {list.lines.length} picked up
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
              const editing = editingId === line.ingredientId;
              return (
                <li key={line.ingredientId} className="p-3">
                  <div className="flex items-start gap-3">
                    <label className="mt-1 grid size-6 shrink-0 cursor-pointer place-items-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecked(line.ingredientId)}
                        className="size-4 accent-[var(--ember-glow)]"
                        aria-label={`Mark ${line.name} ${checked ? "not purchased" : "purchased"}`}
                      />
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium ${checked ? "line-through opacity-60" : ""}`}>
                        {line.packages} × {line.packageLabel} {line.name}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        ${line.cost.toFixed(2)} · {PROVENANCE_LABEL[line.provenance]} · for{" "}
                        {line.usedIn.join(", ")}
                        {line.remainderBase > 0.01 &&
                          ` · ${line.remainderBase.toFixed(1)} ${line.unit} left over`}
                      </p>

                      {!editing ? (
                        <button
                          type="button"
                          onClick={() => startPriceEdit(line.ingredientId, line.unitPrice)}
                          className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-primary"
                        >
                          <Pencil className="size-3.5" /> Confirm or correct package price
                        </button>
                      ) : (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <label className="flex min-h-11 flex-1 items-center border border-border-strong bg-background px-3 sm:max-w-48">
                            <span className="mr-1 text-sm font-bold">$</span>
                            <input
                              autoFocus
                              inputMode="decimal"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={priceDraft}
                              onChange={(e) => setPriceDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  savePrice(line.ingredientId, line.packageLabel);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                              aria-label={`Observed price for ${line.packageLabel} ${line.name}`}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => savePrice(line.ingredientId, line.packageLabel)}
                            className="grid size-11 place-items-center bg-primary text-primary-foreground"
                            aria-label="Save observed price"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="grid size-11 place-items-center border border-border-strong"
                            aria-label="Cancel price edit"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-semibold">Package leftovers</p>
        <p className="mt-1 text-sm text-muted-foreground">
          MealForge estimates ${list.remainderValue.toFixed(2)} of purchased food will remain after
          this whole plan. Bank it once and the next plan can spend it before buying more.
        </p>
        <button
          onClick={stockRemainders}
          disabled={
            leftoversBanked || list.remainderValue <= 0 || checkedCount !== list.lines.length
          }
          className="mt-3 rounded-sm border border-border px-4 py-2 text-sm font-semibold hover:border-ember/50 disabled:cursor-default disabled:opacity-50"
        >
          {leftoversBanked ? "Leftovers banked for next plan" : "Bank leftovers for next plan"}
        </button>
        {checkedCount !== list.lines.length && (
          <p className="mt-2 text-sm text-muted-foreground">
            Check off every purchased item before banking package leftovers.
          </p>
        )}
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
