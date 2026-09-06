import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { EyeOff, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { loadImpactTotals, PROVIDER_STATE_LABEL } from "@/lib/community";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/trust-method")({
  head: () => ({
    meta: [
      { title: "Trust & Method — How ProvisionLoop Works" },
      {
        name: "description",
        content:
          "Plain-language operational transparency: how ProvisionLoop verifies providers, routes requests privately, counts impact and what it does not claim.",
      },
      { property: "og:title", content: "Trust & Method — How ProvisionLoop Works" },
      {
        property: "og:description",
        content:
          "Provider verification states, the full coordination loop, privacy boundaries and pilot limitations.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrustMethodPage,
});

const LOOP = [
  {
    step: "01",
    title: "Private request",
    body: "A household asks for food help through a private form. The request is never published, never shown to sponsors and never attached to a name in a public view.",
  },
  {
    step: "02",
    title: "Verified partner routing",
    body: "An approved community partner reviews an assigned request using its own eligibility and safeguarding practices. Identifiable data stays behind the partner access boundary.",
  },
  {
    step: "03",
    title: "Kitchen capacity",
    body: "A claimed and approved operator publishes usable capacity and its own posted meal cost. ProvisionLoop does not invent or mark up that price.",
  },
  {
    step: "04",
    title: "Volunteer & dispatch",
    body: "Prep shifts and delivery runs expose only what the worker needs to complete the job. Public boards do not expose household identity.",
  },
  {
    step: "05",
    title: "Fulfillment verification",
    body: "Operational states move through preparation and delivery before the loop can close. Payout logic is tied to fulfillment rather than a promise made at checkout.",
  },
  {
    step: "06",
    title: "Aggregate civic ledger",
    body: "Closed outcomes create aggregate impact events. The public can inspect meals, geography and timing without seeing the person who received help.",
  },
] as const;

const STATES = [
  {
    key: "directory" as const,
    detail:
      "A real local food program mapped from public information so people can find help. The organization has not partnered with or endorsed ProvisionLoop and cannot receive platform funding.",
  },
  {
    key: "verified" as const,
    detail:
      "An operator claim has been reviewed and approved. The operator can control provider details and capacity, but verification by itself does not make the provider funding-enabled.",
  },
  {
    key: "funding_enabled" as const,
    detail:
      "A verified operator that has also completed the required payout-readiness state. Server-side funding checks enforce this state rather than relying on a hidden button in the UI.",
  },
];

const NOT_CLAIMED = [
  "We do not call a directory listing a partner, sponsor or affiliate unless the relationship has actually been established.",
  "We do not claim tax-deductible donation status or charitable registration for ProvisionLoop payments.",
  "We do not claim certifications, audits, food-safety accreditation or regulatory approval that have not been independently established.",
  "We do not inflate public impact with demo or projected numbers; sandbox activity is separated from real civic totals.",
  "We do not turn a delivered meal into a broader social-outcome claim. A completed meal is reported as a completed meal.",
  "We do not publish recipient names or identifiable household details in the public ledger.",
];

const LIMITS = [
  "This is a Galveston County pilot. Geographic coverage and verified provider capacity are still limited.",
  "The complete real-money Stripe lifecycle still requires operational certification with live credentials, signed webhooks and an actual payout-enabled provider before it should be described as proven end to end.",
  "Directory details come from public sources and can become stale. People should confirm hours and eligibility with the organization directly.",
  "The civic ledger is intentionally small and privacy-suppressed; it is not a substitute for a countywide needs assessment.",
];

function TrustMethodPage() {
  const totals = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const t = totals.data;

  return (
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="pl-page-intro">
          <div className="site-shell">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="size-4" /> Trust &amp; method
            </div>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              SHOW THE WORK. NOT JUST THE PROMISE.
            </h1>
            <p className="pl-page-deck">
              This is the proof room. It explains the provider states, privacy boundaries, ledger
              rules, payment gates and limitations behind ProvisionLoop so nobody has to trust a
              marketing sentence when the operating rule can be shown instead.
            </p>
            <div className="pl-stage-strip">
              <div><span>01 · Identity</span><strong>Who is actually verified?</strong></div>
              <div><span>02 · Privacy</span><strong>Who can see what?</strong></div>
              <div><span>03 · Money</span><strong>When can funding move?</strong></div>
              <div><span>04 · Proof</span><strong>What is allowed to count?</strong></div>
            </div>

            <div className="mt-10 grid border-2 border-foreground sm:grid-cols-2 lg:grid-cols-4">
              <Fact label="Providers mapped" value={t ? String(t.providersMapped) : "—"} />
              <Fact label="Operator verified" value={t ? String(t.verifiedOperators) : "—"} />
              <Fact label="Funding-enabled kitchens" value={t ? String(t.fundingEnabledKitchens) : "—"} />
              <Fact label="Meals delivered (ledger)" value={t ? String(t.mealsDelivered) : "—"} />
            </div>
          </div>
        </section>

        <section className="bg-foreground text-background">
          <div className="site-shell py-16 md:py-20">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">The operating chain</p>
            <h2 className="mt-4 max-w-[11ch] font-display text-5xl font-black leading-[0.84] tracking-[-0.07em] md:text-8xl">
              REQUEST TO PROOF, WITHOUT EXPOSING A PERSON.
            </h2>
            <div className="mt-10 grid gap-px border border-white/15 bg-white/15 md:grid-cols-2 lg:grid-cols-3">
              {LOOP.map((s) => (
                <article key={s.step} className="bg-foreground p-6 md:p-7">
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">{s.step}</span>
                  <h3 className="mt-4 font-display text-2xl font-black">{s.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#b8b2a7]">{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="kicker text-primary">Provider verification</p>
              <h2 className="mt-3 max-w-[9ch] font-display text-5xl font-black tracking-[-0.055em] md:text-6xl">
                THREE STATES. NO BLUR.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                Visibility, operator verification and funding eligibility are separate facts. The interface and server rules should never collapse them into one badge.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {STATES.map((s, index) => (
                <article key={s.key} className="editorial-card pl-number-card p-6" data-index={String(index + 1).padStart(2, "0")}>
                  <span className="relative z-[1] inline-flex border border-border-strong px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-primary">
                    {PROVIDER_STATE_LABEL[s.key]}
                  </span>
                  <p className="relative z-[1] mt-5 text-sm leading-7 text-muted-foreground">{s.detail}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="pl-trust-note mt-7 max-w-4xl">
            Unclaimed listings stay useful for discovery in <Link to="/help" className="font-bold underline underline-offset-4">Find food help</Link>, but they are never fundable. A funding attempt against an ineligible kitchen is rejected by server-side eligibility checks.
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="site-shell grid gap-10 py-16 md:py-20 lg:grid-cols-2">
            <TrustPanel icon={ReceiptText} eyebrow="How impact counts are created" title="A meal counts late, on purpose.">
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                <li><strong className="text-foreground">Funding events</strong> should enter the real ledger only from confirmed payment events, not intents or abandoned checkout sessions.</li>
                <li><strong className="text-foreground">Delivery events</strong> should enter only after the fulfillment workflow reaches the delivered state.</li>
                <li>Sandbox/test activity is kept separate from real civic totals.</li>
                <li>Payout eligibility is coupled to fulfillment state so the product does not describe money as earned solely because checkout began.</li>
              </ul>
            </TrustPanel>
            <TrustPanel icon={LockKeyhole} eyebrow="Recipient privacy boundary" title="Public proof does not need public people.">
              <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                <li>Household requests are not public content.</li>
                <li>Approved partners receive only referrals assigned within their governed workspace.</li>
                <li>Public volunteer boards show operational drop-off areas and windows rather than recipient identity.</li>
                <li>Public civic reporting is aggregate and suppresses small cohorts.</li>
              </ul>
            </TrustPanel>
          </div>
        </section>

        <section className="site-shell py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="kicker text-primary">Money boundaries</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">WHEN MONEY IS ALLOWED TO MOVE.</h2>
              <div className="mt-6 grid gap-3">
                <Rule text="Payment actions re-check the current required legal acceptance on the server." />
                <Rule text="A kitchen must be approved, active, claimed and payout-ready before it can be funded." />
                <Rule text="Recurring sponsorship checkout pauses when the network has no funding-enabled kitchen capacity." />
                <Rule text="ProvisionLoop pilot payments are not represented as tax-deductible charitable donations." />
              </div>
            </div>
            <div>
              <p className="kicker text-primary">What we refuse to claim</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">THE HONEST LIST.</h2>
              <div className="mt-6 grid gap-3">
                {NOT_CLAIMED.map((claim) => <Rule key={claim} text={claim} />)}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary text-secondary-foreground">
          <div className="site-shell py-16 md:py-20">
            <div className="flex items-start gap-4">
              <EyeOff className="mt-1 size-7 shrink-0" />
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">Pilot limitations</p>
                <h2 className="mt-3 max-w-[10ch] font-display text-5xl font-black tracking-[-0.055em] md:text-6xl">WHAT IS NOT PROVEN YET.</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {LIMITS.map((limit, index) => (
                <article key={limit} className="border border-current/20 bg-background p-5 text-foreground">
                  <span className="font-mono text-[10px] font-black text-primary">0{index + 1}</span>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{limit}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell py-16 md:py-20">
          <div className="editorial-card grid gap-8 p-7 md:grid-cols-[1.2fr_.8fr] md:items-center md:p-10">
            <div>
              <p className="kicker text-primary">For listed organizations</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">CLAIM IT. CORRECT IT. OR REMOVE IT.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                A public directory listing does not mean you signed up. Operators can claim a listing through verification, and any listed organization can request a correction or removal without first becoming a ProvisionLoop partner.
              </p>
            </div>
            <div className="grid gap-3">
              <Link to="/kitchen" className="button-primary justify-center py-4">Start an operator claim</Link>
              <a href={SUPPORT_MAILTO} className="button-secondary justify-center py-4">{SUPPORT_EMAIL}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b-2 border-foreground p-6 last:border-b-0 sm:border-r-2 sm:last:border-r-0 lg:border-b-0">
      <p className="font-display text-4xl font-black tracking-[-0.05em]">{value}</p>
      <p className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </div>
  );
}

function TrustPanel({ icon: Icon, eyebrow, title, children }: { icon: typeof ReceiptText; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <article className="editorial-card p-6 md:p-8">
      <Icon className="size-6 text-primary" />
      <p className="kicker mt-6 text-primary">{eyebrow}</p>
      <h3 className="mt-3 font-display text-3xl font-black tracking-[-0.04em]">{title}</h3>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function Rule({ text }: { text: string }) {
  return <div className="pl-trust-note">{text}</div>;
}
