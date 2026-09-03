import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { loadCivicSnapshot, snapshotToCsv, type WindowDays } from "@/lib/civic";

export const Route = createFileRoute("/civic")({
  head: () => ({
    meta: [
      { title: "City Dashboard — TableForward Civic" },
      {
        name: "description",
        content:
          "Galveston-area food demand, kitchen capacity, funding gaps and volunteer coverage by neighborhood — aggregate only, with CSV export for public reporting.",
      },
      { property: "og:title", content: "City Dashboard — TableForward Civic" },
      {
        property: "og:description",
        content:
          "Aggregate demand, kitchen capacity, funding gaps and volunteer coverage by neighborhood — never individual households.",
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
    a.download = `tableforward-civic-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main className="site-shell py-14 md:py-20">
        <p className="kicker text-primary">Public accountability</p>
        <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
          THE NUMBERS WITHOUT THE NAMES.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Every number here is computed from the public impact ledger, approved kitchen capacity and
          posted volunteer shifts. No household, sponsor or order-level record is readable from this
          surface, by construction.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setDays(w)}
              aria-pressed={days === w}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                days === w
                  ? "border-ember bg-ember text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-ember/50"
              }`}
            >
              Last {w} days
            </button>
          ))}
          <button
            onClick={exportCsv}
            disabled={!data}
            className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:border-ember/50 disabled:opacity-40"
          >
            Export CSV
          </button>
          {area && (
            <button
              onClick={() => setArea(null)}
              className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground"
            >
              Clear “{area}”
            </button>
          )}
        </div>

        {snap.isLoading && (
          <p className="mt-10 text-sm text-muted-foreground">Loading city data…</p>
        )}

        {data && (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Meals funded"
                value={data.totals.funded.toLocaleString()}
                note={`last ${days} days`}
              />
              <Stat
                label="Meals delivered"
                value={data.totals.delivered.toLocaleString()}
                note="confirmed handoffs"
              />
              <Stat
                label="Weekly kitchen capacity"
                value={data.totals.capacityPerWeek.toLocaleString()}
                note={`${data.totals.kitchens} kitchens listed`}
              />
              <Stat
                label="Sponsor dollars landed"
                value={`$${data.totals.dollars.toLocaleString()}`}
                note="at posted cost per meal"
              />
            </div>

            <section className="mt-14">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  Demand versus capacity by area
                </h2>
                <p className="text-xs text-muted-foreground">
                  {data.totals.unclaimed} listed kitchens have not been claimed by their operator
                  yet
                </p>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Area</th>
                      <th className="px-5 py-3 font-medium">Kitchens</th>
                      <th className="px-5 py-3 font-medium">Weekly capacity</th>
                      <th className="px-5 py-3 font-medium">Funded</th>
                      <th className="px-5 py-3 font-medium">Delivered</th>
                      <th className="px-5 py-3 font-medium">Unmet capacity</th>
                      <th className="px-5 py-3 font-medium">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.neighborhood}
                        onClick={() => setArea(r.neighborhood === area ? null : r.neighborhood)}
                        className={`cursor-pointer border-b border-border/60 last:border-0 hover:bg-card ${
                          area === r.neighborhood ? "bg-card" : ""
                        }`}
                      >
                        <td className="px-5 py-3 font-medium">{r.neighborhood}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.kitchens}</td>
                        <td className="px-5 py-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="w-14">{r.capacityPerWeek.toLocaleString()}</span>
                            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                              <span
                                className="block h-full bg-ember"
                                style={{ width: `${(r.capacityPerWeek / maxCapacity) * 100}%` }}
                              />
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">{r.funded.toLocaleString()}</td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.delivered.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.unmet.toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              r.coverage < 0.05
                                ? "text-muted-foreground"
                                : r.coverage < 0.5
                                  ? "text-ember-text"
                                  : "font-semibold"
                            }
                          >
                            {Math.round(r.coverage * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-6 text-sm text-muted-foreground">
                          No kitchens or funded meals in this window.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {data.suppressed > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {data.suppressed} area(s) suppressed for falling below the minimum cohort size.
                </p>
              )}
            </section>

            {focus && (
              <section className="mt-10 rounded-xl border border-border bg-surface p-6">
                <h3 className="font-display text-2xl font-bold">{focus.neighborhood}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MiniStat label="Awaiting delivery" value={focus.awaiting.toLocaleString()} />
                  <MiniStat label="Volunteer shifts posted" value={String(focus.shifts)} />
                  <MiniStat label="Sponsor dollars" value={`$${focus.dollars.toLocaleString()}`} />
                  <MiniStat
                    label="Gap to fill capacity"
                    value={`$${Math.round(focus.unmet * 6.5).toLocaleString()}`}
                  />
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {data.kitchens
                    .filter((k) => (k.neighborhood || k.city) === focus.neighborhood)
                    .map((k) => (
                      <li key={k.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold">{k.name}</p>
                          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                            {k.claimed ? k.kind : "unclaimed listing"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {k.address ? `${k.address} · ` : ""}
                          {k.daily_capacity_meals} meals/day · ${k.cost_per_meal.toFixed(2)} per
                          meal
                        </p>
                        {k.summary && (
                          <p className="mt-2 text-xs text-muted-foreground">{k.summary}</p>
                        )}
                      </li>
                    ))}
                </ul>
              </section>
            )}

            <section className="mt-14">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Daily funded versus delivered
              </h2>
              <TrendChart trend={data.trend} />
            </section>

            <p className="mt-12 max-w-3xl text-xs text-muted-foreground">
              Method: funded and delivered counts come from the public impact ledger, attributed to
              the kitchen's neighborhood. Weekly capacity is the sum of each approved kitchen's
              daily capacity across seven days. Sponsor dollars are estimated at each area's highest
              posted cost per meal. Unclaimed listings are real local programs added by TableForward
              and not yet verified by their operator; they can receive funding but cannot receive a
              payout until the operator claims the listing and completes payout onboarding.
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function TrendChart({
  trend,
}: {
  trend: Array<{ date: string; funded: number; delivered: number }>;
}) {
  if (trend.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        No ledger activity in this window yet.
      </p>
    );
  }
  const max = Math.max(1, ...trend.map((t) => Math.max(t.funded, t.delivered)));
  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-6">
      <div className="flex h-40 items-end gap-1">
        {trend.map((t) => (
          <div
            key={t.date}
            className="flex flex-1 flex-col justify-end gap-0.5"
            title={`${t.date}: ${t.funded} funded, ${t.delivered} delivered`}
          >
            <span
              className="block w-full rounded-t-sm bg-ember/70"
              style={{ height: `${(t.funded / max) * 100}%` }}
            />
            <span
              className="block w-full rounded-b-sm bg-foreground/30"
              style={{ height: `${(t.delivered / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-sm bg-ember/70" /> funded
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-sm bg-foreground/30" /> delivered
        </span>
      </div>
    </div>
  );
}
