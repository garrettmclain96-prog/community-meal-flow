import { Link } from "@tanstack/react-router";

import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SampleTag({ kind = "SAMPLE DATA" }: { kind?: string }) {
  return (
    <span className="ml-2 rounded-full border border-violet/50 px-2 py-0.5 align-middle text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-text">
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

const NAV = [
  { to: "/app", label: "MealForge" },
  { to: "/impact", label: "Fund" },
  { to: "/kitchen", label: "Kitchens" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/partners", label: "Partners" },
  { to: "/civic", label: "Civic" },
] as const;

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
      <header className="sticky top-0 z-50 glass border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display text-lg font-bold tracking-tight">
              Table<span className="aurora-text">Forward</span>
            </Link>
            <div className="hidden items-center gap-5 text-xs font-medium text-muted-foreground lg:flex">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="transition-colors hover:text-foreground">
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <AccountButton />
          </div>
        </div>
      </header>

      <main className="aurora-field mx-auto max-w-6xl px-6 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember-text">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bento p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
                {s.sample !== false && <SampleTag />}
              </p>
              <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
              {s.note && <p className="mt-1.5 text-xs text-muted-foreground">{s.note}</p>}
            </div>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            What this surface does
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {capabilities.map((c) => (
              <li key={c.h} className="bento p-5">
                <p className="font-display font-semibold">{c.h}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {children}

        <section className="bento mt-14 border-ember/40 p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember-text">Build status</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{status}</p>
        </section>
      </main>
    </div>
  );
}
