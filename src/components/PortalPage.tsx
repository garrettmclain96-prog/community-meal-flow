import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

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
      <SiteHeader />

      <main className="site-shell py-14 md:py-20">
        <p className="kicker text-primary">{eyebrow}</p>
        <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="editorial-card p-5">
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
              <li key={c.h} className="editorial-card p-5">
                <p className="font-display font-semibold">{c.h}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {children}

        <section className="editorial-card mt-14 border-l-8 border-l-primary p-6">
          <p className="kicker text-primary">Network access</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{status}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
