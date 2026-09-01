import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AccountButton } from "@/components/AccountButton";
import { useAuth } from "@/hooks/useAuth";
import { fundMeals, listKitchens, listTemplates, loadImpactTotals } from "@/lib/community";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Fund Meals — TableForward Impact" },
      {
        name: "description",
        content:
          "Sponsors and donors fund meals at real community kitchens and see transparent allocation with verified outcomes — never recipient identity.",
      },
      { property: "og:title", content: "Fund Meals — TableForward Impact" },
      {
        property: "og:description",
        content: "Fund meals at real kitchens with a public, verifiable impact ledger.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ImpactPage,
});

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function ImpactPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [kitchenId, setKitchenId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [meals, setMeals] = useState(10);
  const [busy, setBusy] = useState(false);

  const totals = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const kitchens = useQuery({ queryKey: ["kitchens"], queryFn: listKitchens });
  const templates = useQuery({
    queryKey: ["templates", kitchenId],
    queryFn: () => listTemplates(kitchenId),
    enabled: Boolean(kitchenId),
  });

  const kitchen = kitchens.data?.find((k) => k.id === kitchenId) ?? null;
  const template = templates.data?.find((t) => t.id === templateId) ?? null;
  const perMeal = template?.cost_per_meal ?? kitchen?.cost_per_meal ?? 0;
  const amount = useMemo(() => Math.round(perMeal * meals * 100), [perMeal, meals]);

  async function fund() {
    if (!kitchenId) return;
    setBusy(true);
    try {
      await fundMeals({ kitchenId, templateId: templateId || null, meals });
      toast.success(`Funded ${meals} meals — ${money(amount)}`);
      await queryClient.invalidateQueries({ queryKey: ["impact-totals"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not fund those meals");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl font-bold italic tracking-tight">
            Table<span className="text-ember">Forward</span>
          </Link>
          <AccountButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ember-text">TableForward Impact</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold tracking-tight">
          Fund meals with an audit trail attached to every dollar.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Every figure below is read live from the impact ledger. Sponsors see outcomes and aggregate
          neighborhood impact; they never see who received a meal.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Meals funded" value={totals.data?.mealsFunded ?? 0} />
          <Stat label="Meals delivered" value={totals.data?.mealsDelivered ?? 0} />
          <Stat label="Kitchens live" value={totals.data?.kitchens ?? 0} />
          <Stat label="Neighborhoods reached" value={totals.data?.neighborhoods.length ?? 0} />
        </div>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-display text-2xl font-bold">Fund meals now</h2>

            {kitchens.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading kitchens…</p>}
            {kitchens.data?.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                No kitchens have joined yet. A restaurant or community kitchen can register in{" "}
                <Link to="/kitchen" className="underline underline-offset-4">
                  TableForward Kitchen
                </Link>
                , and it becomes fundable here immediately.
              </p>
            )}

            {(kitchens.data?.length ?? 0) > 0 && (
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Kitchen</span>
                  <select
                    value={kitchenId}
                    onChange={(e) => {
                      setKitchenId(e.target.value);
                      setTemplateId("");
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                  >
                    <option value="">Choose a kitchen…</option>
                    {kitchens.data?.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} — {k.neighborhood ?? k.city} (${k.cost_per_meal.toFixed(2)}/meal)
                      </option>
                    ))}
                  </select>
                </label>

                {(templates.data?.length ?? 0) > 0 && (
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Meal</span>
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
                    >
                      <option value="">Kitchen's choice</option>
                      {templates.data?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} — ${t.cost_per_meal.toFixed(2)}/meal
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Meals</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[5, 10, 25, 100].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMeals(n)}
                        aria-pressed={meals === n}
                        className={`rounded-full border px-4 py-1.5 text-sm ${
                          meals === n ? "border-primary bg-primary/10" : "border-border"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={meals}
                      onChange={(e) => setMeals(Math.max(1, Number(e.target.value) || 1))}
                      className="w-24 rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
                    />
                  </div>
                </label>

                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
                  <p className="font-display text-3xl font-bold">{money(amount)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {meals} meals at ${perMeal.toFixed(2)} — the kitchen's own posted cost, not a platform markup.
                  </p>
                </div>

                {user ? (
                  <button
                    type="button"
                    onClick={fund}
                    disabled={!kitchenId || busy}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {busy ? "Recording…" : `Fund ${meals} meals`}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Sign in to fund meals
                  </Link>
                )}
                <p className="text-xs text-muted-foreground">
                  Funding is recorded in the ledger now; card payment settlement is not connected yet, so
                  treat commitments as pledges until a payment provider is enabled.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Live ledger
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {(totals.data?.recent ?? []).map((e) => (
                  <li key={e.id} className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span>
                      <span className="text-ember-text">{e.kind}</span> · {e.meals} meals
                      {e.neighborhood ? ` · ${e.neighborhood}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.occurred_at).toLocaleString()}
                    </span>
                  </li>
                ))}
                {(totals.data?.recent.length ?? 0) === 0 && (
                  <li className="text-muted-foreground">
                    Nothing funded yet — the ledger starts with the first commitment.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                By neighborhood
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {(totals.data?.neighborhoods ?? []).map((n) => (
                  <li key={n.neighborhood} className="flex justify-between">
                    <span>{n.neighborhood}</span>
                    <span className="font-semibold">{n.meals}</span>
                  </li>
                ))}
                {(totals.data?.neighborhoods.length ?? 0) === 0 && (
                  <li className="text-muted-foreground">No neighborhood totals yet.</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
