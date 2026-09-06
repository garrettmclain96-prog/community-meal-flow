import { ArrowRight } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export function SampleTag({ kind = "SAMPLE DATA" }: { kind?: string }) {
  return (
    <span className="ml-2 border border-violet/50 px-2 py-0.5 align-middle text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-text">
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
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="pl-page-intro">
          <div className="site-shell">
            <p className="kicker text-primary">{eyebrow}</p>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">{title}</h1>
            <p className="pl-page-deck">{lede}</p>
            <div className="pl-stage-strip" aria-label="Portal journey">
              <div><span>01 · Enter</span><strong>Know your role</strong></div>
              <div><span>02 · See</span><strong>Read live context</strong></div>
              <div><span>03 · Act</span><strong>Use the right workflow</strong></div>
              <div><span>04 · Close</span><strong>Track the outcome</strong></div>
            </div>
          </div>
        </section>

        <div className="site-shell py-14 md:py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, index) => (
              <div key={s.label} className="editorial-card pl-number-card p-5" data-index={`0${index + 1}`}>
                <p className="relative z-[1] font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                  {s.sample !== false && <SampleTag />}
                </p>
                <p className="relative z-[1] mt-3 font-display text-3xl font-black">{s.value}</p>
                {s.note && <p className="relative z-[1] mt-1.5 text-xs text-muted-foreground">{s.note}</p>}
              </div>
            ))}
          </div>

          <section className="mt-16">
            <div className="grid gap-5 md:grid-cols-[.7fr_1.3fr] md:items-end">
              <div>
                <p className="kicker text-primary">What happens here</p>
                <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">THE SURFACE HAS A JOB.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end">
                Every ProvisionLoop portal exists to move one actor through a real stage of the network — not to bury them in a generic dashboard.
              </p>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {capabilities.map((c, index) => (
                <li key={c.h} className="editorial-card pl-number-card p-6" data-index={String(index + 1).padStart(2, "0")}>
                  <div className="relative z-[1] flex items-start gap-3">
                    <ArrowRight className="mt-1 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-display text-lg font-black">{c.h}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{c.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {children}

          <section className="editorial-card mt-16 border-l-8 border-l-primary p-6 md:p-8">
            <p className="kicker text-primary">Network access</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{status}</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
