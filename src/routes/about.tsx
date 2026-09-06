import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  HeartHandshake,
  LockKeyhole,
  Network,
  ReceiptText,
  UtensilsCrossed,
} from "lucide-react";

import "@/about-experience.css";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ProvisionLoop — Built to Close the Loop" },
      {
        name: "description",
        content:
          "Meet ProvisionLoop, learn why the community food network exists, and meet founder Garrett McLain — the systems builder behind the Galveston County pilot.",
      },
      { property: "og:title", content: "About ProvisionLoop — Built to Close the Loop" },
      {
        property: "og:description",
        content:
          "Private need. Local capacity. Public accountability. Meet the system and the founder building it in Galveston County.",
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
    body: "Restaurants, caterers, churches and community kitchens can turn usable capacity into accountable local meal fulfillment.",
  },
  {
    icon: ReceiptText,
    title: "Proof closes the loop",
    body: "Funding and fulfillment states create aggregate public proof without turning somebody's hardship into marketing material.",
  },
] as const;

function AboutPage() {
  return (
    <div className="pl-about min-h-dvh text-foreground">
      <SiteHeader />
      <main>
        <section className="pl-about-hero">
          <div className="site-shell">
            <p className="kicker text-primary">About ProvisionLoop</p>
            <h1 className="pl-about-title">
              FOOD HELP SHOULD BE A <span>LOOP.</span>
            </h1>
            <p className="pl-about-lead">
              ProvisionLoop is community food infrastructure: one connected system for private food
              need, verified local capacity, accountable funding, volunteer movement, trusted partner
              coordination and public proof that the work actually got finished.
            </p>

            <div className="pl-about-sequence" aria-label="ProvisionLoop operating sequence">
              <div><span>01 · Need</span><strong>Request privately</strong></div>
              <div><span>02 · Capacity</span><strong>Match locally</strong></div>
              <div><span>03 · Action</span><strong>Fund + fulfill</strong></div>
              <div><span>04 · Proof</span><strong>Close publicly</strong></div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="site-shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="kicker text-primary">Why it exists</p>
              <h2 className="mt-4 max-w-[11ch] font-display text-4xl font-black tracking-[-0.055em] md:text-6xl">
                THE GAP ISN&apos;T GENEROSITY. IT&apos;S COORDINATION.
              </h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-muted-foreground md:text-lg">
              <p>
                Communities already contain people willing to help, kitchens capable of producing
                meals, organizations that understand local need and volunteers willing to move food.
                What often fails is the connective tissue between all of them.
              </p>
              <p>
                ProvisionLoop is being built to make that connective tissue explicit. A request can
                enter privately. Capacity can be verified. Funding can go only where the network can
                act. Fulfillment can move through visible states. Aggregate outcomes can close the loop
                without exposing the people being served.
              </p>
              <p className="font-semibold text-foreground">
                The goal is less leakage between good intentions and a meal actually reaching somebody.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-foreground py-16 text-background md:py-24">
          <div className="site-shell">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The operating idea</p>
            <h2 className="mt-5 max-w-5xl font-display text-5xl font-black leading-[0.86] tracking-[-0.065em] md:text-8xl">
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
          <div className="site-shell grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="kicker text-primary">What it is — and isn&apos;t</p>
              <h2 className="mt-4 max-w-[10ch] font-display text-4xl font-black tracking-[-0.055em] md:text-6xl">
                NOT ANOTHER DONATION PAGE.
              </h2>
            </div>
            <div className="grid gap-4">
              <AboutRow icon={Network} title="A coordination layer" body="Funding, kitchens, partners, volunteers and fulfillment are connected instead of treated as unrelated programs." />
              <AboutRow icon={HeartHandshake} title="Built around dignity" body="Public accountability does not require publishing recipient identities or turning hardship into marketing." />
              <AboutRow icon={ReceiptText} title="Designed for traceable outcomes" body="Mapped providers, verified operators, funding eligibility and completed fulfillment are different states — and the product treats them that way." />
            </div>
          </div>
        </section>

        <section id="founder" className="pl-founder scroll-mt-32">
          <div className="site-shell px-0 sm:px-6 lg:px-8">
            <div className="pl-founder-grid">
              <div className="pl-founder-mark" aria-label="Garrett McLain founder mark">
                <span className="pl-founder-initials">GM</span>
              </div>
              <div className="pl-founder-copy">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Founder · Garrett McLain</p>
                <h2 className="pl-founder-quote">BUILT BY SOMEBODY WHO CAN&apos;T LEAVE A BROKEN SYSTEM ALONE.</h2>
                <div className="pl-founder-body space-y-5">
                  <p>
                    ProvisionLoop was founded by Garrett McLain, a Galveston-area systems builder and
                    operations problem-solver whose work lives where software, logistics and real-world
                    execution collide.
                  </p>
                  <p>
                    The idea came from the kind of problem Garrett keeps returning to: plenty of people
                    care, plenty of resources already exist, and yet the outcome still breaks somewhere
                    between intention and execution. ProvisionLoop is the answer to that gap — not as a
                    campaign, but as infrastructure.
                  </p>
                  <p className="font-semibold text-white">
                    The founder thesis is simple: if a community can see its need, verify its capacity,
                    move resources intelligently and prove fulfillment, generosity becomes a system
                    instead of a gamble.
                  </p>
                </div>
                <div className="pl-founder-meta">
                  <span className="pl-founder-chip">Founder</span>
                  <span className="pl-founder-chip">Systems builder</span>
                  <span className="pl-founder-chip">Operations-first</span>
                  <span className="pl-founder-chip">Galveston County</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pl-about-manifesto">
          <div className="site-shell grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] opacity-70">The standard</p>
              <h2 className="mt-4">IF IT DOESN&apos;T CLOSE THE LOOP, IT&apos;S NOT DONE.</h2>
            </div>
            <div>
              <p>
                ProvisionLoop is still in pilot. That is a feature, not a weakness. The model should
                earn trust locally, prove its operating assumptions and become stronger through actual
                closed loops before pretending reach is the same thing as impact.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/pilot" className="button-secondary border-current">
                  Explore the pilot <ArrowUpRight className="size-4" />
                </Link>
                <Link to="/trust-method" className="button-secondary border-current">
                  See the verification method <ArrowRight className="size-4" />
                </Link>
              </div>
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
    <article className="editorial-card flex gap-4 p-5 transition-transform duration-200 hover:-translate-y-1 md:p-6">
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
