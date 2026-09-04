import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/hooks/useAuth";
import { useLegalGate } from "@/hooks/useLegalGate";
import { PAYMENT_DOCS } from "@/lib/legal/registry";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { createSponsorPortalSession } from "@/lib/payments.functions";
import { ProviderStateBadge, TrustLink } from "@/components/ProviderStateBadge";
import { listFundableKitchens, listTemplates, loadImpactTotals } from "@/lib/community";

const SPONSORSHIP_TIERS = [
  {
    priceId: "sponsor_restaurant_monthly",
    name: "Sponsor a restaurant",
    price: "$900 / mo",
    blurb: "Guarantees one small kitchen a daily minimum of funded meals.",
  },
  {
    priceId: "sponsor_school_monthly",
    name: "Sponsor a school",
    price: "$1,500 / mo",
    blurb: "After-hours meals for students and their families at one school.",
  },
  {
    priceId: "sponsor_100_meals_monthly",
    name: "100 meals a week",
    price: "$2,600 / mo",
    blurb: "Steady weekly volume routed wherever demand is highest.",
  },
  {
    priceId: "sponsor_neighborhood_monthly",
    name: "Sponsor a neighborhood",
    price: "$5,000 / mo",
    blurb: "Sustained coverage across every kitchen in one neighborhood.",
  },
] as const;

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Fund Meals — ProvisionLoop Impact" },
      {
        name: "description",
        content:
          "Sponsors and donors fund meals at real community kitchens and see transparent allocation with verified outcomes — never recipient identity.",
      },
      { property: "og:title", content: "Fund Meals — ProvisionLoop Impact" },
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
  const [kitchenId, setKitchenId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [meals, setMeals] = useState(10);
  const [busy, setBusy] = useState(false);
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();

  const totals = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const kitchens = useQuery({ queryKey: ["fundable-kitchens"], queryFn: listFundableKitchens });
  const templates = useQuery({
    queryKey: ["templates", kitchenId],
    queryFn: () => listTemplates(kitchenId),
    enabled: Boolean(kitchenId),
  });
  const sponsorship = useQuery({
    queryKey: ["my-sponsorship", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("status, price_id, current_period_end, cancel_at_period_end")
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const kitchen = kitchens.data?.find((k) => k.id === kitchenId) ?? null;
  const template = templates.data?.find((t) => t.id === templateId) ?? null;
  const perMeal = template?.cost_per_meal ?? kitchen?.cost_per_meal ?? 0;
  const amount = useMemo(() => Math.round(perMeal * meals * 100), [perMeal, meals]);
  const paymentLegal = useLegalGate({
    documents: PAYMENT_DOCS,
    context: "payment_checkout",
    intro:
      "Before payment: ProvisionLoop charges a $0 platform fee on this pilot, and your payment is not a tax-deductible charitable contribution.",
  });

  async function fund() {
    if (!kitchenId) return;
    try {
      await paymentLegal.assertAccepted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Agreement required");
      return;
    }
    openCheckout({
      kind: "meal_funding",
      kitchenId,
      templateId: templateId || null,
      meals,
    });
  }

  async function startSponsorship(priceId: string) {
    try {
      await paymentLegal.assertAccepted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Agreement required");
      return;
    }
    openCheckout({ kind: "sponsorship", priceId });
  }

  async function manageSponsorship() {
    setBusy(true);
    try {
      const result = await createSponsorPortalSession({
        data: { returnUrl: window.location.href, environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open billing");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PaymentTestModeBanner />
      <SiteHeader />

      <main className="site-shell py-14 md:py-20">
        <p className="kicker text-primary">Fund meals · live Galveston pilot</p>
        <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
          TURN LOCAL DOLLARS INTO DINNER.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Funding reaches only kitchens whose operator claimed the listing and enabled payouts.
          Every figure below is read live from the impact ledger. Sponsors see outcomes and
          aggregate neighborhood impact; they never see who received a meal.
        </p>

        <div className="mt-10 grid border-2 border-foreground sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Meals funded" value={totals.data?.mealsFunded ?? 0} />
          <Stat label="Meals delivered" value={totals.data?.mealsDelivered ?? 0} />
          <Stat label="Funding-enabled kitchens" value={totals.data?.fundingEnabledKitchens ?? 0} />
          <Stat label="Neighborhoods reached" value={totals.data?.neighborhoods.length ?? 0} />
        </div>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="editorial-card p-6 md:p-8">
            <p className="kicker text-primary">One-time funding</p>
            <h2 className="mt-2 font-display text-3xl font-black">Fund meals now</h2>

            {kitchens.isLoading && (
              <p className="mt-4 text-sm text-muted-foreground">Loading kitchens…</p>
            )}
            {kitchens.data?.length === 0 && (
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  No kitchen is accepting funding yet. Only providers whose operator has claimed the
                  listing and finished payout onboarding can be funded — the directory listings on{" "}
                  <Link to="/help" className="underline underline-offset-4">
                    Find food
                  </Link>{" "}
                  are mapped local programs, not ProvisionLoop partners.
                </p>
                <p>
                  If you run a kitchen, claim or register it in{" "}
                  <Link to="/kitchen" className="underline underline-offset-4">
                    the kitchen network
                  </Link>
                  ; funding opens once payouts are live.
                </p>
                <TrustLink />
              </div>
            )}

            {(kitchens.data?.length ?? 0) > 0 && (
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Kitchen
                  </span>
                  <select
                    value={kitchenId}
                    onChange={(e) => {
                      setKitchenId(e.target.value);
                      setTemplateId("");
                    }}
                    className="field-control mt-1"
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
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Meal
                    </span>
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="field-control mt-1"
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
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Meals
                  </span>
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
                  <p className="kicker text-muted-foreground">
                    {kitchen ? "Total" : "Choose a kitchen for pricing"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-display text-4xl font-black">
                      {kitchen ? money(amount) : "—"}
                    </p>
                    {kitchen && <ProviderStateBadge state={kitchen.providerState} />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {kitchen
                      ? `${meals} meals at $${perMeal.toFixed(2)} — the kitchen's own posted cost, not a platform markup.`
                      : "Every total is calculated from the selected kitchen's posted meal cost."}
                  </p>
                </div>

                {user ? (
                  <button
                    type="button"
                    onClick={fund}
                    disabled={!kitchenId || busy}
                    className="button-primary w-full py-4 disabled:opacity-60"
                  >
                    {isOpen ? "Checkout open below" : `Fund ${meals} meals — ${money(amount)}`}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    search={{ redirect: "/impact" }}
                    className="button-primary w-full py-4"
                  >
                    Sign in to fund meals
                  </Link>
                )}
                <p className="text-xs text-muted-foreground">
                  Meals only enter the public ledger once the payment clears. The kitchen is paid
                  out from that payment after the meals are delivered. Unclaimed directory listings
                  can never be funded.
                </p>
                <TrustLink />

                {isOpen && (
                  <p className="text-xs text-ember-text">
                    Secure checkout is open at the bottom of this page.
                  </p>
                )}
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
                  <li
                    key={e.id}
                    className="flex items-center justify-between border-b border-border/60 pb-2"
                  >
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

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-ember-text">
                Standing sponsorships
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
                Commit monthly, and kitchens can staff against it.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Recurring sponsorships route only to funding-enabled kitchens. While none are live,
                checkout is paused rather than collecting money we cannot route. <TrustLink />
              </p>
            </div>
            {sponsorship.data && (
              <button
                type="button"
                onClick={manageSponsorship}
                disabled={busy}
                className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-60"
              >
                Manage sponsorship
              </button>
            )}
          </div>

          {sponsorship.data && (
            <p className="mt-3 text-sm text-muted-foreground">
              Active plan: <span className="text-foreground">{sponsorship.data.price_id}</span> ·{" "}
              {sponsorship.data.status}
              {sponsorship.data.current_period_end
                ? ` · renews ${new Date(sponsorship.data.current_period_end).toLocaleDateString()}`
                : ""}
              {sponsorship.data.cancel_at_period_end ? " · cancels at period end" : ""}
            </p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SPONSORSHIP_TIERS.map((tier) => (
              <div key={tier.priceId} className="editorial-card flex flex-col p-6">
                <p className="font-display text-xl font-bold">{tier.name}</p>
                <p className="mt-1 text-ember-text">{tier.price}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{tier.blurb}</p>
                {user ? (
                  <button
                    type="button"
                    onClick={() => openCheckout({ kind: "sponsorship", priceId: tier.priceId })}
                    className="mt-5 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold"
                  >
                    Start sponsorship
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    search={{ redirect: "/impact" }}
                    className="mt-5 rounded-xl border border-primary px-4 py-2.5 text-center text-sm font-semibold"
                  >
                    Sign in to sponsor
                  </Link>
                )}
              </div>
            ))}
          </div>

          {isOpen && (
            <div className="mt-8 rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Secure checkout
                </p>
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="text-xs underline underline-offset-4"
                >
                  Cancel
                </button>
              </div>
              {checkoutElement}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-b border-r border-foreground bg-surface p-5 last:border-r-0 lg:border-b-0">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
