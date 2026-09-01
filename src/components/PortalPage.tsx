import { Link } from "@tanstack/react-router";

import { AccountButton } from "@/components/AccountButton";


export function SampleTag({ kind = "SAMPLE DATA" }: { kind?: string }) {
  return (
    <span className="ml-2 rounded-sm border border-ember/50 px-1.5 py-0.5 align-middle text-[9px] font-semibold uppercase tracking-[0.18em] text-ember-text">
      {kind}
    </span>
  );
}

export interface PortalStat {
  label: string;
  value: string;
  note?: string;
  sample?: boolean;
}

export function PortalPage({
  eyebrow,
  title,
  lede,
  stats,
  capabilities,
  status,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  stats: PortalStat[];
  capabilities: Array<{ h: string; body: string }>;
  status: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl font-bold italic tracking-tight">
            Table<span className="text-ember">Forward</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-ember-text"
            >
              MealForge ↗
            </Link>
            <AccountButton />
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ember-text">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">{lede}</p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-surface p-5">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.label}
                {s.sample !== false && <SampleTag />}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
              {s.note && <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>}
            </div>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            What this surface does
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {capabilities.map((c) => (
              <li key={c.h} className="rounded-lg border border-border bg-surface p-5">
                <p className="font-semibold">{c.h}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {children}

        <section className="mt-14 rounded-lg border border-ember/40 bg-ember/5 p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ember-text">Build status</p>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{status}</p>
        </section>
      </main>
    </div>
  );
}
