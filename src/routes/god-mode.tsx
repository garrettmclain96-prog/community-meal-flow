import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, Database, ShieldCheck, WalletCards } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getGodModeSnapshot } from "@/lib/god-mode.functions";

export const Route = createFileRoute("/god-mode")({
  head: () => ({
    meta: [
      { title: "God Mode — ProvisionLoop" },
      { name: "description", content: "Private ProvisionLoop owner command center." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GodModePage,
});

type ActionRoute =
  | "/admin"
  | "/design"
  | "/kitchen"
  | "/partners"
  | "/volunteer"
  | "/civic"
  | "/impact"
  | "/trust-method";

function GodModePage() {
  const { user, loading, hasRole } = useAuth();
  const canLoad = Boolean(user && hasRole("platform_admin"));
  const snapshot = useQuery({
    queryKey: ["god-mode-snapshot", user?.id],
    enabled: canLoad,
    queryFn: () => getGodModeSnapshot(),
    refetchInterval: 60_000,
  });

  if (loading) return <Shell><StateCard>Checking owner access…</StateCard></Shell>;

  if (!user) {
    return (
      <Shell>
        <StateCard>
          <p className="text-lg font-bold">God Mode is private.</p>
          <p className="mt-2 text-sm text-zinc-400">Sign in with the owner account to continue.</p>
          <Link to="/auth" search={{ redirect: "/god-mode" }} className="mt-5 inline-flex min-h-11 items-center bg-emerald-400 px-4 font-bold text-black">
            Sign in
          </Link>
        </StateCard>
      </Shell>
    );
  }

  if (!hasRole("platform_admin")) {
    return <Shell><StateCard>Not authorized for God Mode.</StateCard></Shell>;
  }

  if (snapshot.isLoading) return <Shell><StateCard>Loading live network state…</StateCard></Shell>;
  if (snapshot.isError) return <Shell><StateCard>God Mode could not load: {snapshot.error.message}</StateCard></Shell>;
  if (!snapshot.data || !snapshot.data.authorized) return <Shell><StateCard>Administrator verification failed.</StateCard></Shell>;

  const data = snapshot.data;
  const funding = dollars(data.funding.confirmedFundingCents);
  const paidOut = dollars(data.funding.payoutCents);

  return (
    <div className="min-h-dvh bg-black text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-400">ProvisionLoop owner console</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">GOD MODE</h1>
          </div>
          <div className="flex items-center gap-2">
            <HealthPip ok={data.health.database} label="DB" />
            <HealthPip ok={data.health.auth} label="AUTH" />
            <HealthPip ok={data.health.webhookConfigured} label="WEBHOOK" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Confirmed funding" value={funding} note={`${data.funding.fundedMeals.toLocaleString()} meals funded`} />
          <Metric label="Delivered meals" value={data.operations.deliveredMeals.toLocaleString()} note={statusLine(data.operations.deliveriesByStatus)} />
          <Metric label="Funding-enabled kitchens" value={String(data.kitchens.fundingEnabled)} note={`${data.kitchens.approved} approved · ${data.kitchens.test} test`} />
          <Metric label="Paid to kitchens" value={paidOut} note={statusLine(data.funding.payoutsByStatus)} />
        </section>

        {data.partialErrors.length > 0 && (
          <section className="border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
            Partial data warning: {data.partialErrors.join(" · ")}
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel icon={<WalletCards className="size-5" />} title="Funding integrity" eyebrow="Money movement">
            <StatusRows rows={data.funding.ordersByStatus} empty="No funded orders yet" />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <MiniStat label="Checkouts" value={sumStatuses(data.funding.checkoutsByStatus)} />
              <MiniStat label="Sandbox/test" value={data.funding.sandboxCheckouts} />
            </div>
          </Panel>

          <Panel icon={<Activity className="size-5" />} title="Operations" eyebrow="Delivery + volunteer">
            <StatusRows rows={data.operations.deliveriesByStatus} empty="No delivery runs yet" />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <MiniStat label="Active volunteers" value={data.operations.activeVolunteers} />
              <MiniStat label="Upcoming shift slots" value={data.operations.upcomingSlots} />
            </div>
          </Panel>

          <Panel icon={<Database className="size-5" />} title="Network capacity" eyebrow="Kitchens + partners">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MiniStat label="Mapped kitchens" value={data.kitchens.total} />
              <MiniStat label="Claimed kitchens" value={data.kitchens.claimed} />
              <MiniStat label="Partners" value={data.partners.total} />
              <MiniStat label="Approved partners" value={data.partners.approved} />
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-zinc-500">Kitchen claims</p>
            <StatusRows rows={data.kitchens.claimsByStatus} empty="No kitchen claims" />
          </Panel>

          <Panel icon={<ShieldCheck className="size-5" />} title="Owner queues" eyebrow="Needs attention">
            <Queue label="Privacy" rows={data.queues.privacy} />
            <Queue label="Refunds" rows={data.queues.refunds} />
            <Queue label="Pilot" rows={data.queues.pilot} />
          </Panel>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">Control surfaces</p>
              <h2 className="mt-1 text-2xl font-black">Operate the network</h2>
            </div>
            <p className="hidden text-xs text-zinc-500 sm:block">Snapshot {new Date(data.generatedAt).toLocaleTimeString()}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Action to="/admin" label="Operations Queue" note="Privacy, refunds, pilot" />
            <Action to="/design" label="Design Control" note="Requirements + open items" />
            <Action to="/kitchen" label="Kitchen Network" note="Listings + claims" />
            <Action to="/partners" label="Partner Network" note="Referrals + capacity" />
            <Action to="/volunteer" label="Volunteer Ops" note="Shifts + delivery" />
            <Action to="/civic" label="Civic View" note="City-level reporting" />
            <Action to="/impact" label="Funding Surface" note="Public funding workflow" />
            <Action to="/trust-method" label="Trust & Method" note="Verification model" />
          </div>
        </section>

        <section className="border-t border-zinc-800 pt-5 text-xs text-zinc-500">
          Stripe: {data.health.stripeConfigured ? data.health.stripeMode.toUpperCase() : "NOT CONFIGURED"} · Webhook {data.health.webhookConfigured ? "READY" : "MISSING"} · OpenAI {data.health.openAiConfigured ? "READY" : "NOT CONFIGURED"}. No secrets or recipient PII are exposed here.
        </section>
      </main>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-dvh place-items-center bg-black px-4 text-zinc-100">{children}</div>;
}

function StateCard({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-lg border border-zinc-800 bg-zinc-950 p-6">{children}</div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="border border-zinc-800 bg-zinc-950 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-zinc-400">{note}</p>
    </article>
  );
}

function Panel({ icon, title, eyebrow, children }: { icon: React.ReactNode; title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <div className="grid size-10 place-items-center bg-emerald-400 text-black">{icon}</div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">{eyebrow}</p>
          <h2 className="text-xl font-black">{title}</h2>
        </div>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function StatusRows({ rows, empty }: { rows: Record<string, number>; empty: string }) {
  const entries = Object.entries(rows).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <p className="text-sm text-zinc-500">{empty}</p>;
  return (
    <div className="space-y-2">
      {entries.map(([label, count]) => (
        <div key={label} className="flex items-center justify-between border-b border-zinc-900 pb-2 text-sm">
          <span className="capitalize text-zinc-400">{label.replaceAll("_", " ")}</span>
          <span className="font-mono font-bold text-white">{count}</span>
        </div>
      ))}
    </div>
  );
}

function Queue({ label, rows }: { label: string; rows: Record<string, number> }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-bold">{label}</p>
        <span className="font-mono text-xs text-emerald-400">{sumStatuses(rows)}</span>
      </div>
      <StatusRows rows={rows} empty={`No ${label.toLowerCase()} items`} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-zinc-800 bg-black p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function Action({ to, label, note }: { to: ActionRoute; label: string; note: string }) {
  return (
    <Link to={to} className="group min-h-28 border border-zinc-800 bg-zinc-950 p-4 transition hover:border-emerald-400">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{label}</p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">{note}</p>
        </div>
        <ArrowUpRight className="size-4 text-zinc-600 transition group-hover:text-emerald-400" />
      </div>
    </Link>
  );
}

function HealthPip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 border border-zinc-800 px-2 py-1 font-mono text-[9px] text-zinc-400">
      <span className={`size-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />
      {label}
    </div>
  );
}

function dollars(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

function sumStatuses(rows: Record<string, number>) {
  return Object.values(rows).reduce((sum, value) => sum + value, 0);
}

function statusLine(rows: Record<string, number>) {
  const total = sumStatuses(rows);
  if (!total) return "No activity yet";
  return Object.entries(rows)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label, count]) => `${count} ${label.replaceAll("_", " ")}`)
    .join(" · ");
}
