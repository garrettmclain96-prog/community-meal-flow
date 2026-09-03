import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { advanceOrder, listTemplates } from "@/lib/community";
import { SHIFT_ROLES, claimKitchen, listShiftsForKitchen, listSignups } from "@/lib/volunteer";
import { getStripeEnvironment } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import {
  createKitchenPayoutOnboarding,
  refreshKitchenPayoutStatus,
  submitKitchenPayout,
  settleOrderPayout,
} from "@/lib/payments.functions";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen Operations — ProvisionLoop Kitchen" },
      {
        name: "description",
        content:
          "Restaurants, food trucks and community kitchens register capacity, post meal templates, accept funded orders and track guaranteed revenue.",
      },
      { property: "og:title", content: "Kitchen Operations — ProvisionLoop Kitchen" },
      {
        property: "og:description",
        content: "Capacity, funded orders and payout tracking for community kitchens.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KitchenPage,
});

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function KitchenPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const mine = useQuery({
    queryKey: ["my-kitchen", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kitchens")
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const kitchenId = mine.data?.id ?? "";

  const templates = useQuery({
    queryKey: ["templates", kitchenId],
    enabled: Boolean(kitchenId),
    queryFn: () => listTemplates(kitchenId),
  });

  const orders = useQuery({
    queryKey: ["kitchen-orders", kitchenId],
    enabled: Boolean(kitchenId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funded_orders")
        .select("*")
        .eq("kitchen_id", kitchenId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const payouts = useQuery({
    queryKey: ["kitchen-payouts", kitchenId],
    enabled: Boolean(kitchenId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("kitchen_id", kitchenId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const support = useQuery({
    queryKey: ["kitchen-support", kitchenId],
    enabled: Boolean(kitchenId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_kitchen_support", {
        _kitchen_id: kitchenId,
      });
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        kind: string;
        title: string;
        amount_cents: number;
        status: string;
        details: string | null;
      }>;
    },
  });

  const funded = (orders.data ?? []).reduce((n, o) => n + o.meals_funded, 0);
  const pipeline = (orders.data ?? [])
    .filter((o) => o.status !== "delivered")
    .reduce((n, o) => n + o.amount_cents, 0);
  const earned = (payouts.data ?? []).reduce((n, p) => n + p.amount_cents, 0);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PaymentTestModeBanner />
      <SiteHeader />

      <main className="site-shell py-14 md:py-20">
        <p className="kicker text-primary">ProvisionLoop for kitchens</p>
        <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
          TURN OPEN CAPACITY INTO PAID MEALS.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Register your kitchen, publish what you can cook and at what price, then work funded
          orders through accepted, prepared and delivered. Delivery queues a payout automatically.
        </p>

        {!user && (
          <div className="editorial-card mt-10 grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="font-display text-2xl font-black">
                Run a restaurant, food truck, church, school or community kitchen?
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Claim an existing listing or register capacity, publish meal costs and receive
                tracked funded orders.
              </p>
            </div>
            <Link to="/auth" search={{ redirect: "/kitchen" }} className="button-primary">
              Claim or register
            </Link>
          </div>
        )}

        {user && mine.isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading…</p>}

        {user && !mine.isLoading && !mine.data && (
          <>
            <ClaimListings
              onClaimed={() => {
                void qc.invalidateQueries({ queryKey: ["my-kitchen"] });
                void qc.invalidateQueries({ queryKey: ["kitchens"] });
              }}
            />
            <RegisterKitchen
              onCreated={() => {
                void qc.invalidateQueries({ queryKey: ["my-kitchen"] });
                void qc.invalidateQueries({ queryKey: ["kitchens"] });
              }}
            />
          </>
        )}

        {mine.data && (
          <>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Meals funded to you" value={funded.toLocaleString()} />
              <Stat label="Open pipeline" value={money(pipeline)} />
              <Stat label="Queued payouts" value={money(earned)} />
              <Stat label="Daily capacity" value={`${mine.data.daily_capacity_meals} meals`} />
            </div>

            <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-xl border border-border bg-surface p-6">
                <h2 className="font-display text-2xl font-bold">Funded orders</h2>
                <ul className="mt-4 space-y-3">
                  {(orders.data ?? []).map((o) => (
                    <li key={o.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {o.meals_funded} meals · {money(o.amount_cents)}
                        </p>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-widest text-ember-text">
                          {o.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.sponsor_name ?? "Anonymous sponsor"} ·{" "}
                        {new Date(o.created_at).toLocaleString()}
                      </p>
                      <div className="mt-3 flex gap-2">
                        {(["accepted", "prepared", "delivered"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={o.status === s || o.status === "delivered"}
                            onClick={async () => {
                              try {
                                await advanceOrder(o.id, s);
                                if (s === "delivered") {
                                  const result = await settleOrderPayout({
                                    data: { orderId: o.id, environment: getStripeEnvironment() },
                                  });
                                  if ("error" in result) {
                                    toast.error(`Delivered, but payout failed: ${result.error}`);
                                  } else if (result.status === "paid") {
                                    toast.success("Delivered — payout sent to your account");
                                  } else if (result.status === "awaiting_onboarding") {
                                    toast.message(
                                      "Delivered — finish payout setup to release the funds",
                                    );
                                  }
                                } else {
                                  toast.success(`Marked ${s}`);
                                }
                                await qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
                                await qc.invalidateQueries({ queryKey: ["kitchen-payouts"] });
                                await qc.invalidateQueries({ queryKey: ["impact-totals"] });
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Update failed");
                              }
                            }}
                            className="rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                  {(orders.data?.length ?? 0) === 0 && (
                    <li className="text-sm text-muted-foreground">
                      No funded orders yet. Sponsors can fund your kitchen from{" "}
                      <Link to="/impact" className="underline underline-offset-4">
                        Impact
                      </Link>
                      .
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-8">
                <PayoutPanel
                  kitchenId={kitchenId}
                  payoutStatus={mine.data.payout_status ?? "not_started"}
                  payouts={payouts.data ?? []}
                  onChanged={async () => {
                    await qc.invalidateQueries({ queryKey: ["my-kitchen"] });
                    await qc.invalidateQueries({ queryKey: ["kitchen-payouts"] });
                  }}
                />

                <MealTemplates
                  kitchenId={kitchenId}
                  templates={templates.data ?? []}
                  onChanged={() => void qc.invalidateQueries({ queryKey: ["templates"] })}
                />

                <SupportPanel
                  awards={support.data ?? []}
                  onChanged={() =>
                    void qc.invalidateQueries({ queryKey: ["kitchen-support", kitchenId] })
                  }
                />
              </div>
            </section>

            <ShiftsPanel kitchenId={kitchenId} defaultNeighborhood={mine.data.neighborhood ?? ""} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function SupportPanel({
  awards,
  onChanged,
}: {
  awards: Array<{
    id: string;
    kind: string;
    title: string;
    amount_cents: number;
    status: string;
    details: string | null;
  }>;
  onChanged: () => void;
}) {
  return (
    <section className="editorial-card p-6">
      <p className="kicker text-primary">Kitchen stability</p>
      <h2 className="mt-2 font-display text-2xl font-black">Support beyond meal orders</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Revenue floors, micro-grants, supply credits, equipment and volunteer labor offered to this
        kitchen appear here.
      </p>
      <div className="mt-5 grid gap-3">
        {awards.map((award) => (
          <div key={award.id} className="border-2 border-foreground p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-display text-lg font-black">{award.title}</p>
                <p className="font-mono text-xs uppercase">{award.kind.replaceAll("_", " ")}</p>
              </div>
              <p className="font-mono text-sm font-bold">
                {award.amount_cents ? money(award.amount_cents) : award.status}
              </p>
            </div>
            {award.details && <p className="mt-3 text-sm text-muted-foreground">{award.details}</p>}
            {award.status === "available" && (
              <button
                type="button"
                className="button-secondary mt-4"
                onClick={async () => {
                  const { error } = await supabase.rpc("apply_for_kitchen_support", {
                    _award_id: award.id,
                  });
                  if (error) toast.error(error.message);
                  else {
                    toast.success("Support request submitted");
                    onChanged();
                  }
                }}
              >
                Request support
              </button>
            )}
            {award.status !== "available" && (
              <p className="mt-3 font-mono text-xs font-bold uppercase">{award.status}</p>
            )}
          </div>
        ))}
        {!awards.length && (
          <p className="text-sm text-muted-foreground">
            No support offers are assigned to this kitchen yet.
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function RegisterKitchen({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [kind, setKind] = useState("restaurant");
  const [city, setCity] = useState("Galveston");
  const [neighborhood, setNeighborhood] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [cost, setCost] = useState(6.5);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("kitchens").insert({
      owner_id: user!.id,
      name,
      kind,
      city,
      neighborhood: neighborhood || null,
      daily_capacity_meals: capacity,
      cost_per_meal: cost,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kitchen registered");
    onCreated();
  }

  return (
    <form
      onSubmit={submit}
      className="mt-10 max-w-xl rounded-xl border border-border bg-surface p-6"
    >
      <h2 className="font-display text-2xl font-bold">Register your kitchen</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Type">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
            {[
              "restaurant",
              "food truck",
              "caterer",
              "community kitchen",
              "church kitchen",
              "school kitchen",
            ].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Neighborhood">
          <input
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Daily capacity (meals)">
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value) || 1)}
            className={inputCls}
          />
        </Field>
        <Field label="Cost per meal ($)">
          <input
            type="number"
            min={1}
            step="0.25"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value) || 1)}
            className={inputCls}
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Saving…" : "Register kitchen"}
      </button>
    </form>
  );
}

function MealTemplates({
  kitchenId,
  templates,
  onChanged,
}: {
  kitchenId: string;
  templates: Array<{ id: string; name: string; cost_per_meal: number; servings_per_batch: number }>;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState(6.5);
  const [batch, setBatch] = useState(25);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("meal_templates").insert({
      kitchen_id: kitchenId,
      name,
      cost_per_meal: cost,
      servings_per_batch: batch,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setName("");
    toast.success("Meal published");
    onChanged();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display text-2xl font-bold">Meals you can cook</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {templates.map((t) => (
          <li key={t.id} className="flex justify-between border-b border-border/60 pb-2">
            <span>{t.name}</span>
            <span className="text-muted-foreground">
              ${t.cost_per_meal.toFixed(2)} · batch {t.servings_per_batch}
            </span>
          </li>
        ))}
        {templates.length === 0 && (
          <li className="text-muted-foreground">Nothing published yet.</li>
        )}
      </ul>

      <form onSubmit={add} className="mt-5 grid gap-3 sm:grid-cols-3">
        <input
          required
          placeholder="Chicken and rice bowl"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputCls} sm:col-span-3`}
        />
        <input
          type="number"
          step="0.25"
          min={1}
          value={cost}
          onChange={(e) => setCost(Number(e.target.value) || 1)}
          className={inputCls}
          aria-label="Cost per meal"
        />
        <input
          type="number"
          min={1}
          value={batch}
          onChange={(e) => setBatch(Number(e.target.value) || 1)}
          className={inputCls}
          aria-label="Servings per batch"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Publish
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

type PayoutRow = {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  failure_reason?: string | null;
};

function PayoutPanel({
  kitchenId,
  payoutStatus,
  payouts,
  onChanged,
}: {
  kitchenId: string;
  payoutStatus: string;
  payouts: PayoutRow[];
  onChanged: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function onboard() {
    setBusy("onboard");
    try {
      const result = await createKitchenPayoutOnboarding({
        data: {
          kitchenId,
          returnUrl: window.location.href,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank");
      toast.success("Payout onboarding opened in a new tab");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payout onboarding");
    } finally {
      setBusy(null);
    }
  }

  async function refresh() {
    setBusy("refresh");
    try {
      const result = await refreshKitchenPayoutStatus({
        data: { kitchenId, environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      await onChanged();
      toast.success(`Payout status: ${result.status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh payout status");
    } finally {
      setBusy(null);
    }
  }

  async function send(payoutId: string) {
    setBusy(payoutId);
    try {
      const result = await submitKitchenPayout({
        data: { payoutId, environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      await onChanged();
      toast.success("Payout sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payout failed");
    } finally {
      setBusy(null);
    }
  }

  const label =
    payoutStatus === "ready"
      ? "Ready to receive payouts"
      : payoutStatus === "onboarding"
        ? "Onboarding incomplete"
        : "Not set up";

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Payouts</h2>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-widest text-ember-text">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Sponsors pay by card. Once you mark an order delivered, its payout is queued here and sent
        to your bank through your connected payout account.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onboard}
          disabled={busy !== null}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {payoutStatus === "not_started" ? "Set up payouts" : "Continue payout setup"}
        </button>
        <button
          type="button"
          onClick={refresh}
          disabled={busy !== null}
          className="rounded-xl border border-border px-4 py-2.5 text-sm disabled:opacity-60"
        >
          Refresh status
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        {payouts.map((p) => (
          <li key={p.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{money(p.amount_cents)}</p>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {p.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(p.created_at).toLocaleString()}
              {p.failure_reason ? ` · ${p.failure_reason}` : ""}
            </p>
            {p.status !== "paid" && (
              <button
                type="button"
                onClick={() => send(p.id)}
                disabled={busy !== null || payoutStatus !== "ready"}
                className="mt-3 rounded-full border border-primary px-3 py-1 text-xs disabled:opacity-40"
              >
                {busy === p.id ? "Sending…" : "Send payout"}
              </button>
            )}
          </li>
        ))}
        {payouts.length === 0 && (
          <li className="text-sm text-muted-foreground">
            No payouts queued yet — deliver a funded order and one appears here.
          </li>
        )}
      </ul>
    </div>
  );
}

function ClaimListings({ onClaimed }: { onClaimed: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const listings = useQuery({
    queryKey: ["unclaimed-kitchens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kitchens")
        .select(
          "id, name, kind_detail, city, neighborhood, address, daily_capacity_meals, cost_per_meal, summary, website",
        )
        .eq("claimed", false)
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  if ((listings.data?.length ?? 0) === 0) return null;

  return (
    <section className="mt-10 rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display text-2xl font-bold">Already feeding people here?</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        These Galveston-area programs are listed on ProvisionLoop from public information and have
        not been claimed yet. If you run one, claim it — the listing becomes your account, with
        capacity, pricing, funded orders and payouts under your control.
      </p>

      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {(listings.data ?? []).map((k) => (
          <li key={k.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{k.name}</p>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                unclaimed
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {[k.address, k.neighborhood, k.city].filter(Boolean).join(" · ")}
            </p>
            {k.summary && <p className="mt-2 text-xs text-muted-foreground">{k.summary}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Listed at {k.daily_capacity_meals} meals/day · ${Number(k.cost_per_meal).toFixed(2)}{" "}
              per meal
            </p>

            {openId === k.id ? (
              <form
                className="mt-3 space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    await claimKitchen(k.id, role, note);
                    toast.success(`${k.name} is yours — check your capacity and pricing`);
                    onClaimed();
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Could not claim this listing",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <input
                  required
                  placeholder="Your role (owner, kitchen manager, pastor…)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputCls}
                />
                <textarea
                  placeholder="Anything we should know about your program"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`${inputCls} min-h-16`}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-full bg-ember px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {busy ? "Claiming…" : "Confirm claim"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="rounded-full border border-border px-4 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpenId(k.id);
                  setRole("");
                  setNote("");
                }}
                className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:border-ember/50"
              >
                Claim this listing
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShiftsPanel({
  kitchenId,
  defaultNeighborhood,
}: {
  kitchenId: string;
  defaultNeighborhood: string;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<string>("prep");
  const [start, setStart] = useState("");
  const [hours, setHours] = useState(3);
  const [slots, setSlots] = useState(4);
  const [notes, setNotes] = useState("");

  const shifts = useQuery({
    queryKey: ["kitchen-shifts", kitchenId],
    enabled: Boolean(kitchenId),
    queryFn: () => listShiftsForKitchen(kitchenId),
  });
  const signups = useQuery({
    queryKey: ["kitchen-signups", kitchenId],
    enabled: Boolean(kitchenId),
    queryFn: listSignups,
  });
  const roster = useQuery({
    queryKey: ["kitchen-volunteers", kitchenId],
    enabled: Boolean(kitchenId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteers")
        .select("id, full_name, phone, can_drive, skills");
      if (error) throw error;
      return data ?? [];
    },
  });

  const volunteerById = new Map((roster.data ?? []).map((v) => [v.id, v]));

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!start) {
      toast.error("Pick a start time");
      return;
    }
    const startsAt = new Date(start);
    const { error } = await supabase.from("volunteer_shifts").insert({
      kitchen_id: kitchenId,
      title,
      role,
      starts_at: startsAt.toISOString(),
      ends_at: new Date(startsAt.getTime() + hours * 3_600_000).toISOString(),
      slots,
      notes: notes || null,
      neighborhood: defaultNeighborhood || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTitle("");
    setNotes("");
    toast.success("Shift posted to the volunteer board");
    void qc.invalidateQueries({ queryKey: ["kitchen-shifts"] });
    void qc.invalidateQueries({ queryKey: ["shifts"] });
  }

  return (
    <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-2xl font-bold">Post a volunteer shift</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prep, cook, serve, pack, clean or drive. Posted shifts appear instantly on the volunteer
          board.
        </p>
        <form onSubmit={post} className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input
              required
              placeholder="Saturday lunch service line"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputCls}
            aria-label="Role"
          >
            {SHIFT_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputCls}
            aria-label="Starts at"
          />
          <input
            type="number"
            min={1}
            max={12}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value) || 1)}
            className={inputCls}
            aria-label="Length in hours"
          />
          <input
            type="number"
            min={1}
            value={slots}
            onChange={(e) => setSlots(Number(e.target.value) || 1)}
            className={inputCls}
            aria-label="Slots"
          />
          <textarea
            placeholder="Where to park, what to wear, who to ask for"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputCls} sm:col-span-2 min-h-16`}
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:col-span-2"
          >
            Post shift
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-2xl font-bold">Your roster</h2>
        <ul className="mt-4 space-y-3">
          {(shifts.data ?? []).map((s) => {
            const joined = (signups.data ?? []).filter((g) => g.shift_id === s.id);
            return (
              <li key={s.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {joined.length}/{s.slots} filled
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.role} ·{" "}
                  {new Date(s.starts_at).toLocaleString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {joined.map((g) => {
                    const v = volunteerById.get(g.volunteer_id);
                    return (
                      <li key={g.id}>
                        {v?.full_name ?? "Volunteer"}
                        {v?.phone ? ` · ${v.phone}` : ""}
                        {v?.can_drive ? " · can drive" : ""} · {g.status}
                      </li>
                    );
                  })}
                  {joined.length === 0 && <li>No signups yet.</li>}
                </ul>
              </li>
            );
          })}
          {(shifts.data?.length ?? 0) === 0 && (
            <li className="text-sm text-muted-foreground">Nothing posted yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
