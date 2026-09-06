import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, HeartHandshake, LockKeyhole, Network, ReceiptText, UtensilsCrossed } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ProvisionLoop — Community Food Infrastructure" },
      {
        name: "description",
        content:
          "Why ProvisionLoop exists, how the closed-loop community food network works, and what makes its approach different.",
      },
      { property: "og:title", content: "About ProvisionLoop" },
      {
        property: "og:description",
        content: "Private need. Local capacity. Public accountability. Learn why ProvisionLoop is building community food infrastructure in Galveston County.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  {
    icon: LockKeyhole,
    title: "Need stays private",
    body: "People asking for food should not have to become public content. Recipient details stay inside the workflows that actually need them.",
  },
  {
    icon: UtensilsCrossed,
    title: "Capacity stays local",
    body: "ProvisionLoop is designed to turn usable capacity in restaurants, caterers, churches and community kitchens into funded meals.",
  },
  {
    icon: ReceiptText,
    title: "Proof closes the loop",
    body: "Funding is tied to fulfillment states and aggregate outcomes so the public can see what the network accomplished without exposing the people it served.",
  },
] as const;

function AboutPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b-2 border-foreground py-16 md:py-24">
          <div className="site-shell">
            <p className="kicker text-primary">About ProvisionLoop</p>
            <h1 className="display-title mt-5 max-w-6xl text-6xl md:text-8xl lg:text-9xl">
              FOOD HELP SHOULD BE A LOOP, NOT A LEAP OF FAITH.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              ProvisionLoop is community food infrastructure: one system connecting private food need,
              local kitchens, accountable funding, volunteers, trusted partners and public proof that
              the work was actually completed.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="site-shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="kicker text-primary">Why it exists</p>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tight md:text-6xl">
                THE GAP ISN&apos;T GENEROSITY. IT&apos;S COORDINATION.
              </h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-muted-foreground md:text-lg">
              <p>
                Communities already contain people willing to help, kitchens capable of producing
                meals, organizations that understand local need and volunteers willing to move food.
                The problem is that those pieces often operate in separate systems.
              </p>
              <p>
                ProvisionLoop is being built to connect those pieces into one accountable workflow.
                A request can be routed privately. Funding can be directed toward eligible local
                capacity. A meal can move through fulfillment. The resulting impact can be reported
                publicly in aggregate.
              </p>
              <p className="font-semibold text-foreground">
                The goal is simple: less money and effort lost between good intentions and a meal
                actually reaching somebody who needs it.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y-2 border-foreground bg-foreground py-16 text-background md:py-24">
          <div className="site-shell">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              The operating idea
            </p>
            <h2 className="mt-5 max-w-5xl font-display text-5xl font-black leading-[0.9] tracking-[-0.05em] md:text-8xl">
              PRIVATE NEED. LOCAL CAPACITY. PUBLIC ACCOUNTABILITY.
            </h2>
            <div className="mt-12 grid gap-px bg-white/20 md:grid-cols-3">
              {PRINCIPLES.map(({ icon: Icon, title, body }) => (
                <article key={title} className="bg-foreground p-6 md:p-8">
                  <Icon className="size-7 text-primary" />
                  <h3 className="mt-6 font-display text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#b8b2a7]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="site-shell">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="kicker text-primary">What it is — and isn&apos;t</p>
                <h2 className="mt-4 font-display text-4xl font-black md:text-6xl">
                  NOT ANOTHER DONATION PAGE.
                </h2>
              </div>
              <div className="grid gap-4">
                <AboutRow icon={Network} title="A coordination layer" body="Funding, kitchens, partners, volunteers and fulfillment are connected instead of treated as unrelated programs." />
                <AboutRow icon={HeartHandshake} title="Built around dignity" body="Public accountability does not require publishing recipient identities or turning hardship into marketing." />
                <AboutRow icon={ReceiptText} title="Designed for traceable outcomes" body="The platform distinguishes mapped providers, verified operators, funding eligibility and completed fulfillment instead of treating every listing as equivalent." />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground py-16 md:py-24">
          <div className="site-shell grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="kicker text-primary">Starting local</p>
              <h2 className="mt-4 max-w-4xl font-display text-5xl font-black leading-[0.92] tracking-[-0.04em] md:text-7xl">
                BUILT IN GALVESTON COUNTY. DESIGNED TO PROVE THE MODEL FIRST.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                ProvisionLoop is in its pilot stage. That matters. The platform should earn trust by
                closing real local loops, measuring what works and making the operating model stronger
                before pretending scale is the same thing as impact.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/pilot" className="button-primary">
                Explore the pilot <ArrowUpRight className="size-4" />
              </Link>
              <Link to="/trust-method" className="button-secondary">
                Trust &amp; method
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function AboutRow({ icon: Icon, title, body }: { icon: typeof Network; title: string; body: string }) {
  return (
    <article className="editorial-card flex gap-4 p-5 md:p-6">
      <div className="shrink-0 border-2 border-foreground p-3">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-display text-xl font-black">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}
