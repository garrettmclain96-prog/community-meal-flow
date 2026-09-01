import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AccountButton } from "@/components/AccountButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { advanceOrder, listTemplates } from "@/lib/community";
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
      { title: "Kitchen Operations — TableForward Kitchen" },
      {
        name: "description",
        content:
          "Restaurants, food trucks and community kitchens register capacity, post meal templates, accept funded orders and track guaranteed revenue.",
      },
      { property: "og:title", content: "Kitchen Operations — TableForward Kitchen" },
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

  const funded = (orders.data ?? []).reduce((n, o) => n + o.meals_funded, 0);
  const pipeline = (orders.data ?? [])
    .filter((o) => o.status !== "delivered")
    .reduce((n, o) => n + o.amount_cents, 0);
  const earned = (payouts.data ?? []).reduce((n, p) => n + p.amount_cents, 0);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PaymentTestModeBanner />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl font-bold italic tracking-tight">
            Table<span className="text-ember">Forward</span>
          </Link>
          <AccountButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ember-text">TableForward Kitchen</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold tracking-tight">
          Guaranteed orders, posted at your own cost per meal.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Register your kitchen, publish what you can cook and at what price, then work funded orders
          through accepted, prepared and delivered. Delivery queues a payout automatically.
        </p>

        {!user && (
          <div className="mt-10 rounded-xl border border-border bg-surface p-6">
            <p className="text-sm text-muted-foreground">
              Sign in with a kitchen account to register capacity and accept funded orders.
            </p>
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Sign in
            </Link>
          </div>
        )}

        {user && mine.isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading…</p>}

        {user && !mine.isLoading && !mine.data && (
          <RegisterKitchen
            onCreated={() => {
              void qc.invalidateQueries({ queryKey: ["my-kitchen"] });
              void qc.invalidateQueries({ queryKey: ["kitchens"] });
            }}
          />
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
                                    toast.message("Delivered — finish payout setup to release the funds");
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
              </div>
            </section>

          </>
        )}
      </main>
    </div>
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
  const [city, setCity] = useState("Austin");
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
    <form onSubmit={submit} className="mt-10 max-w-xl rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display text-2xl font-bold">Register your kitchen</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Type">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
            {["restaurant", "food truck", "caterer", "community kitchen", "church kitchen", "school kitchen"].map(
              (k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ),
            )}
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
        Sponsors pay by card. Once you mark an order delivered, its payout is queued here and sent to
        your bank through your connected payout account.
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
