import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleDollarSign, ReceiptText, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { ProviderStateBadge, TrustLink } from "@/components/ProviderStateBadge";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLegalGate } from "@/hooks/useLegalGate";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { listFundableKitchens, listTemplates, loadImpactTotals } from "@/lib/community";
import { PAYMENT_DOCS } from "@/lib/legal/registry";
import { createSponsorPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const SPONSORSHIP_TIERS = [
  {
    priceId: "sponsor_restaurant_monthly",
    name: "Back a local kitchen",
    price: "$900 / mo",
    blurb: "Recurring capacity support that can route only to an approved, funding-enabled kitchen.",
  },
  {
    priceId: "sponsor_school_monthly",
    name: "Support school-area meals",
    price: "$1,500 / mo",
    blurb: "Recurring support for eligible school-area meal capacity when an approved provider is available.",
  },
  {
    priceId: "sponsor_100_meals_monthly",
    name: "Target 100 meals a week",
    price: "$2,600 / mo",
    blurb: "A recurring funding target intended to create steady weekly capacity where the live network can fulfill it.",
  },
  {
    priceId: "sponsor_neighborhood_monthly",
    name: "Back a neighborhood",
    price: "$5,000 / mo",
    blurb: "Recurring support intended for eligible capacity across one local coverage area, subject to live provider availability.",
  },
] as const;

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Fund Meals — ProvisionLoop Impact" },
      {
        name: "description",
        content:
          "Fund meals through verified local kitchen capacity and follow aggregate outcomes without exposing recipient identity.",
      },
      { property: "og:title", content: "Fund Meals — ProvisionLoop Impact" },
      {
        property: "og:description",
        content: "Choose eligible local capacity, fund meals, and follow the aggregate outcome through ProvisionLoop's public ledger.",
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
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <PaymentTestModeBanner />
      <SiteHeader />

      <main>
        <section className="pl-page-intro">
          <div className="site-shell">
            <p className="kicker text-primary">Fund meals · live Galveston pilot</p>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              TURN LOCAL DOLLARS INTO DINNER.
            </h1>
            <p className="pl-page-deck">
              Choose capacity the network can actually use. ProvisionLoop allows funding only through
              approved, claimed, active kitchens with payout readiness, then records aggregate outcomes
              without exposing who received a meal.
            </p>
            <div className="pl-stage-strip">
              <div><span>01 · Choose</span><strong>Eligible local kitchen</strong></div>
              <div><span>02 · Define</span><strong>Meals + posted cost</strong></div>
              <div><span>03 · Fund</span><strong>Secure checkout</strong></div>
              <div><span>04 · Close</span><strong>Delivery → public proof</strong></div>
            </div>
          </div>
        </section>

        <div className="site-shell py-14 md:py-20">
          <div className="grid border-2 border-foreground sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Meals funded" value={totals.data?.mealsFunded ?? 0} icon={CircleDollarSign} />
            <Stat label="Meals delivered" value={totals.data?.mealsDelivered ?? 0} icon={UtensilsCrossed} />
            <Stat label="Funding-enabled kitchens" value={totals.data?.fundingEnabledKitchens ?? 0} icon={ShieldCheck} />
            <Stat label="Neighborhoods reached" value={totals.data?.neighborhoods.length ?? 0} icon={ReceiptText} />
          </div>

          <section className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="editorial-card p-6 md:p-8">
              <p className="kicker text-primary">One-time funding · step by step</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em]">BUILD ONE CLOSED LOOP.</h2>

              {kitchens.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading eligible kitchens…</p>}
              {kitchens.data?.length === 0 && (
                <div className="pl-trust-note mt-5 space-y-3">
                  <p>
                    No kitchen is accepting funding yet. ProvisionLoop will not collect money when the
                    live network has nowhere eligible to route it.
                  </p>
                  <p>
                    Directory listings on <Link to="/help" className="font-bold underline underline-offset-4">Find food help</Link>{" "}
                    are mapped local resources, not automatically ProvisionLoop partners. If you run a
                    kitchen, use <Link to="/kitchen" className="font-bold underline underline-offset-4">the kitchen network</Link>{" "}
                    to claim or register it.
                  </p>
                  <TrustLink />
                </div>
              )}

              {(kitchens.data?.length ?? 0) > 0 && (
                <div className="mt-6 space-y-5">
                  <label className="block">
                    <span className="field-label">1 · Choose a funding-enabled kitchen</span>
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
                          {k.name}{k.is_test ? " — Test-mode pilot kitchen — not a real partner" : ""} —{" "}
                          {k.neighborhood ?? k.city} (${k.cost_per_meal.toFixed(2)}/meal)
                        </option>
                      ))}
                    </select>
                  </label>

                  {(templates.data?.length ?? 0) > 0 && (
                    <label className="block">
                      <span className="field-label">2 · Choose a meal template</span>
                      <select
                        value={templateId}
                        onChange={(e) => setTemplateId(e.target.value)}
                        className="field-control mt-1"
                      >
                        <option value="">Kitchen&apos;s choice</option>
                        {templates.data?.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} — ${t.cost_per_meal.toFixed(2)}/meal</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="block">
                    <span className="field-label">{(templates.data?.length ?? 0) > 0 ? "3" : "2"} · Number of meals</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[5, 10, 25, 100].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMeals(n)}
                          aria-pressed={meals === n}
                          className={`border px-4 py-1.5 text-sm font-bold ${meals === n ? "border-primary bg-primary/10" : "border-border"}`}
                        >
                          {n}
                        </button>
                      ))}
                      <input
                        aria-label="Custom number of meals"
                        type="number"
                        min={1}
                        max={5000}
                        value={meals}
                        onChange={(e) => setMeals(Math.max(1, Number(e.target.value) || 1))}
                        className="field-control w-28 py-1.5 text-sm"
                      />
                    </div>
                  </label>

                  <div className="pl-action-card p-5">
                    <p className="kicker text-muted-foreground">Live checkout total</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="font-display text-5xl font-black tracking-[-0.06em]">{kitchen ? money(amount) : "—"}</p>
                      {kitchen && <ProviderStateBadge state={kitchen.providerState} isTest={kitchen.is_test} />}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {kitchen
                        ? `${meals} meals at $${perMeal.toFixed(2)} — the selected kitchen's posted cost, not a ProvisionLoop markup.`
                        : "Choose an eligible kitchen to calculate the total from its posted meal cost."}
                    </p>
                  </div>

                  {user && (
                    <div className="pl-trust-note">
                      <p className="font-semibold text-foreground">Before you pay</p>
                      <p className="mt-1">
                        Platform fee: <strong className="text-foreground">$0.00</strong>. Payment processing is handled by Stripe in the currently configured environment. This payment is <strong className="text-foreground">not tax-deductible</strong>; ProvisionLoop is not a charity and issues no donation receipt.
                      </p>
                      {paymentLegal.gate && <div className="mt-4">{paymentLegal.gate}</div>}
                    </div>
                  )}

                  {user ? (
                    <button
                      type="button"
                      onClick={() => void fund()}
                      disabled={!kitchenId || busy || !paymentLegal.satisfied}
                      className="button-primary w-full py-4 disabled:opacity-60"
                    >
                      {isOpen ? "Secure checkout is open below" : `Continue to fund ${meals} meals — ${money(amount)}`}
                    </button>
                  ) : (
                    <Link to="/auth" search={{ redirect: "/impact" }} className="button-primary w-full py-4">
                      Sign in to fund meals
                    </Link>
                  )}
                  <p className="text-xs leading-5 text-muted-foreground">
                    Meals enter the public ledger only after the payment clears. Payout is tied to completed fulfillment; unclaimed directory listings cannot receive funding.
                  </p>
                  <TrustLink />

                  {isOpen && <p className="text-xs font-bold text-primary">Secure checkout is ready at the bottom of this page ↓</p>}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="editorial-card p-6">
                <p className="kicker text-primary">Live ledger · what happens after funding</p>
                <h2 className="mt-2 font-display text-2xl font-black">THE MONEY DOESN&apos;T DISAPPEAR AFTER CHECKOUT.</h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {(totals.data?.recent ?? []).map((e) => (
                    <li key={e.id} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
                      <span><span className="font-bold text-primary">{e.kind}</span> · {e.meals} meals{e.neighborhood ? ` · ${e.neighborhood}` : ""}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{new Date(e.occurred_at).toLocaleDateString()}</span>
                    </li>
                  ))}
                  {(totals.data?.recent.length ?? 0) === 0 && (
                    <li className="text-muted-foreground">No completed funding events yet. The real ledger starts with the first cleared commitment.</li>
                  )}
                </ul>
              </div>

              <div className="editorial-card p-6">
                <p className="kicker text-primary">Coverage</p>
                <h2 className="mt-2 font-display text-2xl font-black">BY NEIGHBORHOOD.</h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {(totals.data?.neighborhoods ?? []).map((n) => (
                    <li key={n.neighborhood} className="flex justify-between border-b border-border/60 pb-2">
                      <span>{n.neighborhood}</span>
                      <span className="font-bold">{n.meals} meals</span>
                    </li>
                  ))}
                  {(totals.data?.neighborhoods.length ?? 0) === 0 && <li className="text-muted-foreground">No neighborhood totals yet.</li>}
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-20 border-t border-foreground pt-12">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="kicker text-primary">Recurring support</p>
                <h2 className="mt-3 max-w-3xl font-display text-4xl font-black tracking-[-0.05em] md:text-5xl">
                  GIVE THE NETWORK SOMETHING IT CAN PLAN AROUND.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Recurring sponsorship checkout is available only when the live network has eligible capacity. If it does not, ProvisionLoop pauses rather than collecting money it cannot responsibly route. <TrustLink />
                </p>
              </div>
              {sponsorship.data && (
                <button type="button" onClick={manageSponsorship} disabled={busy} className="button-secondary disabled:opacity-60">
                  Manage sponsorship
                </button>
              )}
            </div>

            {sponsorship.data && (
              <p className="pl-trust-note mt-5">
                Current plan: <strong className="text-foreground">{sponsorship.data.price_id}</strong> · {sponsorship.data.status}
                {sponsorship.data.current_period_end ? ` · renews ${new Date(sponsorship.data.current_period_end).toLocaleDateString()}` : ""}
                {sponsorship.data.cancel_at_period_end ? " · cancels at period end" : ""}
              </p>
            )}

            {user && !paymentLegal.satisfied && (
              <div className="pl-trust-note mt-6">
                <p className="font-semibold text-foreground">Agreement required before recurring checkout</p>
                <p className="mt-1">Platform fee: <strong className="text-foreground">$0.00</strong>. Sponsorship payments are <strong className="text-foreground">not tax-deductible</strong>.</p>
                <div className="mt-4">{paymentLegal.gate}</div>
              </div>
            )}

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {SPONSORSHIP_TIERS.map((tier, index) => (
                <div key={tier.priceId} className="editorial-card pl-number-card flex flex-col p-6" data-index={String(index + 1).padStart(2, "0")}>
                  <p className="relative z-[1] font-display text-xl font-black">{tier.name}</p>
                  <p className="relative z-[1] mt-1 font-bold text-primary">{tier.price}</p>
                  <p className="relative z-[1] mt-3 flex-1 text-sm leading-6 text-muted-foreground">{tier.blurb}</p>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => void startSponsorship(tier.priceId)}
                      disabled={!paymentLegal.satisfied}
                      className="button-secondary relative z-[1] mt-5 disabled:opacity-60"
                    >
                      Start sponsorship
                    </button>
                  ) : (
                    <Link to="/auth" search={{ redirect: "/impact" }} className="button-secondary relative z-[1] mt-5 text-center">
                      Sign in to sponsor
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {isOpen && (
              <div className="editorial-card mt-10 p-4 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="kicker text-primary">Secure checkout</p>
                    <p className="mt-1 text-xs text-muted-foreground">Finish the payment here without leaving the ProvisionLoop flow.</p>
                  </div>
                  <button type="button" onClick={closeCheckout} className="button-secondary">Cancel</button>
                </div>
                {checkoutElement}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof CircleDollarSign }) {
  return (
    <div className="relative overflow-hidden border-b border-r border-foreground bg-surface p-5 last:border-r-0 lg:border-b-0">
      <Icon className="size-5 text-primary" />
      <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl font-black tracking-[-0.05em]">{value.toLocaleString()}</p>
    </div>
  );
}
