import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { loadCivicSnapshot, snapshotToCsv, type WindowDays } from "@/lib/civic";

export const Route = createFileRoute("/civic")({
  head: () => ({
    meta: [
      { title: "Public Ledger — ProvisionLoop Civic" },
      {
        name: "description",
        content:
          "Aggregate Galveston-area food funding, delivery and kitchen capacity with privacy suppression and CSV export — numbers without recipient names.",
      },
      { property: "og:title", content: "Public Ledger — ProvisionLoop Civic" },
      {
        property: "og:description",
        content: "See aggregate funding, fulfillment and local capacity while recipient identity stays private.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CivicPage,
});

const WINDOWS: WindowDays[] = [7, 30, 90];

function CivicPage() {
  const [days, setDays] = useState<WindowDays>(30);
  const [area, setArea] = useState<string | null>(null);

  const snap = useQuery({
    queryKey: ["civic", days],
    queryFn: () => loadCivicSnapshot(days),
  });
  const data = snap.data;
  const rows = data?.rows ?? [];
  const focus = area ? rows.find((r) => r.neighborhood === area) : null;
  const maxCapacity = Math.max(1, ...rows.map((r) => r.capacityPerWeek));

  function exportCsv() {
    if (!data) return;
    const blob = new Blob([snapshotToCsv(data)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `provisionloop-civic-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="pl-page-intro">
          <div className="site-shell">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="size-4" /> Public accountability
            </div>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              THE NUMBERS WITHOUT THE NAMES.
            </h1>
            <p className="pl-page-deck">
              This is ProvisionLoop&apos;s public proof surface. Real-world totals exclude sandbox
              kitchens, small cohorts are suppressed, and recipient identity never becomes a public
              metric.
            </p>
            <div className="pl-stage-strip">
              <div><span>01 · Observe</span><strong>Real network totals</strong></div>
              <div><span>02 · Compare</span><strong>Demand vs. capacity</strong></div>
              <div><span>03 · Inspect</span><strong>Neighborhood context</strong></div>
              <div><span>04 · Export</span><strong>Take the proof with you</strong></div>
            </div>
          </div>
        </section>

        <div className="site-shell py-14 md:py-20">
          <div className="flex flex-wrap items-center gap-2">
            {WINDOWS.map((w) => (
              <button
                key={w}
                onClick={() => setDays(w)}
                aria-pressed={days === w}
                className={`border px-4 py-2 text-xs font-bold transition-colors ${
                  days === w
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                Last {w} days
              </button>
            ))}
            <button
              onClick={exportCsv}
              disabled={!data}
              className="button-secondary text-xs disabled:opacity-40"
            >
              <Download className="size-4" /> Export CSV
            </button>
            {area && (
              <button onClick={() => setArea(null)} className="button-secondary text-xs">
                Clear “{area}”
              </button>
            )}
          </div>

          {snap.isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading public proof…</p>}
          {snap.isError && (
            <p className="pl-trust-note mt-10 text-destructive">
              Civic data could not be loaded. Nothing has been substituted or estimated in its place.
            </p>
          )}

          {data && (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Meals funded" value={data.totals.funded.toLocaleString()} note={`real-world ledger · last ${days} days`} icon={BarChart3} />
                <Stat label="Meals delivered" value={data.totals.delivered.toLocaleString()} note="confirmed real-world handoffs" icon={ShieldCheck} />
                <Stat label="Weekly kitchen capacity" value={data.totals.capacityPerWeek.toLocaleString()} note={`${data.totals.kitchens} approved non-test kitchens`} icon={BarChart3} />
                <Stat label="Estimated sponsor dollars" value={`$${data.totals.dollars.toLocaleString()}`} note="funded meals × posted meal cost; not settlement total" icon={BarChart3} />
              </div>

              {(data.test.kitchens > 0 || data.test.events > 0) && (
                <div className="pl-trust-note mt-5">
                  <strong className="text-foreground">Sandbox is excluded from every total above.</strong>{" "}
                  Current sandbox: {data.test.kitchens} test kitchen{data.test.kitchens === 1 ? "" : "s"}, {data.test.capacityPerWeek.toLocaleString()} test meals/week of capacity, and {data.test.events} test ledger event{data.test.events === 1 ? "" : "s"} in this window.
                </div>
              )}

              <section className="mt-16">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="kicker text-primary">Network geometry</p>
                    <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em]">DEMAND VERSUS CAPACITY BY AREA.</h2>
                  </div>
                  <p className="max-w-md text-xs leading-5 text-muted-foreground">
                    {data.totals.unclaimed} real-world directory listing{data.totals.unclaimed === 1 ? " is" : "s are"} not operator-verified. Tap a row to inspect the area.
                  </p>
                </div>

                <div className="mt-6 overflow-x-auto border border-border bg-surface shadow-[6px_6px_0_color-mix(in_oklab,var(--foreground)_10%,transparent)]">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <th className="px-5 py-4 font-bold">Area</th>
                        <th className="px-5 py-4 font-bold">Kitchens</th>
                        <th className="px-5 py-4 font-bold">Weekly capacity</th>
                        <th className="px-5 py-4 font-bold">Funded</th>
                        <th className="px-5 py-4 font-bold">Delivered</th>
                        <th className="px-5 py-4 font-bold">Unused capacity</th>
                        <th className="px-5 py-4 font-bold">Coverage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.neighborhood}
                          onClick={() => setArea(r.neighborhood === area ? null : r.neighborhood)}
                          className={`cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-card ${area === r.neighborhood ? "bg-card" : ""}`}
                        >
                          <td className="px-5 py-4 font-bold">{r.neighborhood}</td>
                          <td className="px-5 py-4 text-muted-foreground">{r.kitchens}</td>
                          <td className="px-5 py-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="w-14">{r.capacityPerWeek.toLocaleString()}</span>
                              <span className="h-1.5 w-24 overflow-hidden bg-border">
                                <span className="block h-full bg-primary" style={{ width: `${(r.capacityPerWeek / maxCapacity) * 100}%` }} />
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">{r.impactSuppressed ? "Suppressed" : r.funded.toLocaleString()}</td>
                          <td className="px-5 py-4 text-muted-foreground">{r.impactSuppressed ? "Suppressed" : r.delivered.toLocaleString()}</td>
                          <td className="px-5 py-4 text-muted-foreground">{r.unmet.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            {r.impactSuppressed ? (
                              <span className="inline-flex items-center gap-1 text-muted-foreground"><EyeOff className="size-3" /> Hidden</span>
                            ) : (
                              <span className={r.coverage < 0.05 ? "text-muted-foreground" : r.coverage < 0.5 ? "text-primary" : "font-bold"}>
                                {Math.round(r.coverage * 100)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr><td colSpan={7} className="px-5 py-8 text-sm text-muted-foreground">No real-world kitchens or reportable impact in this window.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {data.suppressed > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <EyeOff className="size-4" /> {data.suppressed} area(s) have impact counts hidden because they are below the minimum public cohort threshold.
                  </p>
                )}
              </section>

              {focus && (
                <section className="editorial-card mt-10 p-6 md:p-8">
                  <p className="kicker text-primary">Area focus</p>
                  <h3 className="mt-2 font-display text-4xl font-black tracking-[-0.05em]">{focus.neighborhood}</h3>
                  {focus.impactSuppressed ? (
                    <p className="pl-trust-note mt-5">
                      Impact counts for this area are below the minimum public cohort threshold and are intentionally hidden. Public provider capacity can still be shown.
                    </p>
                  ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <MiniStat label="Awaiting delivery" value={focus.awaiting.toLocaleString()} />
                      <MiniStat label="Volunteer shifts posted" value={String(focus.shifts)} />
                      <MiniStat label="Estimated sponsor dollars" value={`$${focus.dollars.toLocaleString()}`} />
                      <MiniStat label="Estimated gap to fill capacity" value={`$${Math.round(focus.unmet * 6.5).toLocaleString()}`} />
                    </div>
                  )}
                  <ul className="mt-6 space-y-3 text-sm">
                    {data.kitchens
                      .filter((k) => !k.is_test && (k.neighborhood || k.city) === focus.neighborhood)
                      .map((k) => (
                        <li key={k.id} className="border border-border bg-card p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold">{k.name}</p>
                            <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              {k.claimed && k.payout_status === "ready" ? "Funding enabled" : k.claimed ? "Operator verified" : "Directory listing — not affiliated"}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {k.address ? `${k.address} · ` : ""}{k.daily_capacity_meals} meals/day · ${k.cost_per_meal.toFixed(2)} per meal
                          </p>
                          {k.summary && <p className="mt-2 text-xs leading-5 text-muted-foreground">{k.summary}</p>}
                        </li>
                      ))}
                  </ul>
                </section>
              )}

              <section className="mt-16">
                <p className="kicker text-primary">Over time</p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em]">FUNDED VERSUS DELIVERED.</h2>
                <TrendChart trend={data.trend} />
              </section>

              <div className="pl-trust-note mt-12 max-w-4xl">
                <strong className="text-foreground">Method.</strong> Real-world funded and delivered counts come from the public impact ledger; test-kitchen events are excluded. Weekly capacity is approved, active, non-test kitchen capacity across seven days. Neighborhood impact counts below the public cohort threshold are suppressed. Sponsor dollars are estimates based on funded meals and posted meal costs; they are not settled-payment totals. Directory listings are mapped from public information and are not affiliated with ProvisionLoop. Funding requires operator verification plus payout readiness.
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof BarChart3 }) {
  return (
    <div className="editorial-card p-5">
      <Icon className="size-5 text-primary" />
      <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-black">{value}</p>
    </div>
  );
}

function TrendChart({ trend }: { trend: Array<{ date: string; funded: number; delivered: number }> }) {
  if (trend.length === 0) {
    return <p className="pl-trust-note mt-4">No reportable ledger activity in this window yet.</p>;
  }
  const max = Math.max(1, ...trend.map((t) => Math.max(t.funded, t.delivered)));
  return (
    <div className="editorial-card mt-5 p-6">
      <div className="flex h-44 items-end gap-1" aria-label="Funded and delivered trend chart">
        {trend.map((t) => (
          <div key={t.date} className="flex flex-1 flex-col justify-end gap-0.5" title={`${t.date}: ${t.funded} funded, ${t.delivered} delivered`}>
            <span className="block w-full bg-primary/70" style={{ height: `${(t.funded / max) * 100}%` }} />
            <span className="block w-full bg-foreground/30" style={{ height: `${(t.delivered / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-2 w-4 bg-primary/70" /> funded</span>
        <span className="flex items-center gap-2"><span className="h-2 w-4 bg-foreground/30" /> delivered</span>
      </div>
    </div>
  );
}
