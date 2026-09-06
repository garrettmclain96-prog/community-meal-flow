import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChefHat,
  Fingerprint,
  HandHeart,
  MapPin,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";

import "@/home-refresh.css";
import heroTable from "@/assets/hero-table.jpg";
import { ProviderStateBadge } from "@/components/ProviderStateBadge";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { listKitchens, loadImpactTotals } from "@/lib/community";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProvisionLoop — Local Food Infrastructure for Galveston County" },
      {
        name: "description",
        content:
          "ProvisionLoop coordinates local meal funding, verified kitchen capacity, private assistance, volunteer delivery and public aggregate proof across Galveston County.",
      },
      { property: "og:title", content: "ProvisionLoop — Private need. Local capacity. Public proof." },
      {
        property: "og:description",
        content:
          "A closed-loop community food network connecting funding, kitchens, partners, volunteers and public accountability.",
      },
      { property: "og:image", content: heroTable },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

const PATHS = [
  {
    to: "/impact",
    number: "01",
    icon: HandHeart,
    title: "Fund meals",
    body: "Put money behind verified local kitchen capacity and track the aggregate outcome.",
    action: "Open funding",
  },
  {
    to: "/help",
    number: "02",
    icon: MapPin,
    title: "Get food help",
    body: "Find nearby resources or submit a private request routed through trusted partners.",
    action: "Find support",
  },
  {
    to: "/kitchen",
    number: "03",
    icon: ChefHat,
    title: "Activate a kitchen",
    body: "Restaurants, caterers, churches and community kitchens can convert open capacity into funded meals.",
    action: "Join the network",
  },
  {
    to: "/volunteer",
    number: "04",
    icon: Users,
    title: "Move the meals",
    body: "Claim local prep and delivery work that closes the loop from kitchen to community.",
    action: "See opportunities",
  },
] as const;

function HomePage() {
  const impact = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const kitchens = useQuery({ queryKey: ["public-kitchens"], queryFn: listKitchens });
  const totals = impact.data;

  return (
    <div className="pl-home min-h-dvh">
      <SiteHeader />

      <main>
        <section className="pl-hero">
          <div className="site-shell pl-hero-grid">
            <div className="pl-hero-copy">
              <div className="pl-eyebrow text-primary"><Radio className="size-3" /> Live civic food network</div>
              <h1 className="pl-hero-title">
                NEED IN.
                <br />
                <span>MEALS OUT.</span>
              </h1>
              <p className="pl-hero-deck">
                ProvisionLoop connects private food need to verified local kitchens, accountable
                funding, volunteer delivery and a public aggregate ledger. It is infrastructure for
                finishing the job — not another donation page.
              </p>

              <div className="pl-hero-actions">
                <Link to="/impact" className="pl-hero-primary">
                  Fund local meals <ArrowUpRight className="size-4" />
                </Link>
                <Link to="/help" className="pl-hero-secondary">
                  I need food help <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="pl-live-strip" aria-label="Live ProvisionLoop pilot totals">
                <LiveStat label="Meals funded" value={totals ? totals.mealsFunded.toLocaleString() : "—"} />
                <LiveStat label="Meals delivered" value={totals ? totals.mealsDelivered.toLocaleString() : "—"} />
                <LiveStat label="Funding-ready kitchens" value={totals ? String(totals.fundingEnabledKitchens) : "—"} />
              </div>

              <p className="mt-4 max-w-xl font-mono text-[10px] uppercase leading-5 tracking-[0.08em] text-[#777269]">
                Live pilot totals only. No demo numbers. {totals ? `${totals.providersMapped} providers mapped. ` : ""}
                <Link to="/trust-method" className="text-primary underline underline-offset-4">
                  See verification method
                </Link>
              </p>
            </div>

            <div className="pl-hero-visual">
              <img src={heroTable} alt="Neighbors gathered around a shared table" width={1024} height={1024} />
              <div className="pl-visual-badge">
                <ShieldCheck className="size-4" /> closed-loop accountability
              </div>
              <div className="pl-visual-card">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">The system</p>
                <strong>Private need → local capacity → verified fulfillment → public proof.</strong>
              </div>
              <div className="pl-scroll-cue" aria-hidden="true"><span>enter the loop</span><i /></div>
            </div>
          </div>
        </section>

        <section className="pl-loop-rail" aria-label="How ProvisionLoop closes the loop">
          <div className="site-shell pl-loop-rail-grid">
            <LoopNode number="01" label="Need enters privately" />
            <LoopNode number="02" label="Capacity is verified" />
            <LoopNode number="03" label="Money + people move" />
            <LoopNode number="04" label="Proof closes publicly" />
          </div>
        </section>

        <section className="pl-section">
          <div className="site-shell">
            <div className="grid items-end gap-8 md:grid-cols-[1fr_.72fr]">
              <div>
                <p className="pl-section-kicker">Choose your lane</p>
                <h2 className="pl-section-title">ONE NETWORK. FOUR WAYS IN.</h2>
              </div>
              <p className="max-w-lg text-sm leading-7 opacity-65 md:justify-self-end">
                Start with the outcome you need. ProvisionLoop routes you into the right workflow
                without forcing everyone through the same dashboard.
              </p>
            </div>

            <div className="pl-lanes">
              {PATHS.map(({ to, number, icon: Icon, title, body, action }) => (
                <Link key={to} to={to} className="pl-lane group">
                  <div className="flex items-start justify-between gap-4">
                    <span className="pl-lane-number">{number}</span>
                    <Icon className="pl-lane-icon size-7" />
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className="pl-lane-action">
                    {action} <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pl-section pl-why-section">
          <div className="site-shell grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <p className="pl-section-kicker">Why ProvisionLoop?</p>
              <h2 className="pl-section-title">THE GAP ISN&apos;T GENEROSITY. IT&apos;S COORDINATION.</h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-sm leading-7 opacity-70 md:text-base">
                Communities already have people willing to help, kitchens with usable capacity,
                organizations that understand local need and volunteers willing to move food. The
                failure point is what happens between those pieces. ProvisionLoop connects them into
                one accountable loop.
              </p>
              <Link to="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                Experience the story <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="pl-section pl-proof-section">
          <div className="site-shell">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.19em] opacity-70">The accountability loop</p>
            <h2 className="mt-4 max-w-[11ch] font-display text-[clamp(3rem,8vw,7rem)] font-black leading-[0.84] tracking-[-0.075em]">
              MONEY IN. MEALS OUT. PROOF ATTACHED.
            </h2>

            <div className="pl-proof-grid">
              <ProofStep number="01" title="Funding is constrained" body="Only eligible, funding-enabled kitchens can receive meal funding through the platform." />
              <ProofStep number="02" title="Fulfillment is tracked" body="Orders move through preparation and delivery states instead of disappearing after checkout." />
              <ProofStep number="03" title="Impact closes publicly" body="Aggregate delivery events feed the public ledger without exposing recipient identities." />
            </div>
          </div>
        </section>

        <section className="pl-section">
          <div className="site-shell">
            <div className="grid gap-8 md:grid-cols-[1fr_.8fr] md:items-end">
              <div>
                <p className="pl-section-kicker">Local capacity</p>
                <h2 className="pl-section-title">THE NETWORK IS VISIBLE.</h2>
              </div>
              <div className="md:justify-self-end">
                <p className="max-w-lg text-sm leading-7 opacity-65">
                  Mapped providers are labeled honestly. A directory listing does not automatically
                  mean affiliation or funding eligibility.
                </p>
                <Link to="/kitchen" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary">
                  Explore kitchen network <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="pl-network-grid">
              {(kitchens.data ?? []).slice(0, 6).map((kitchen) => (
                <div key={kitchen.id} className="pl-network-row">
                  <div className="pl-network-icon"><Building2 className="size-4" /></div>
                  <div className="min-w-0">
                    <p className="pl-network-name">{kitchen.name}</p>
                    <p className="pl-network-meta">{kitchen.neighborhood || kitchen.city} · {kitchen.kind.replaceAll("_", " ")}</p>
                  </div>
                  <ProviderStateBadge state={kitchen.providerState} isTest={kitchen.is_test} />
                </div>
              ))}
              {kitchens.isLoading && <div className="pl-network-row text-sm opacity-60">Loading mapped providers…</div>}
              {!kitchens.isLoading && (kitchens.data?.length ?? 0) === 0 && (
                <div className="pl-network-row text-sm opacity-60">Mapped providers will appear here as the directory grows.</div>
              )}
            </div>
          </div>
        </section>

        <section className="pl-founder-tease">
          <div className="site-shell pl-founder-tease-grid">
            <div className="pl-founder-tease-mark"><Fingerprint className="size-8" /><strong>GM</strong></div>
            <div>
              <p className="pl-section-kicker">Built from the ground up</p>
              <h2>MEET THE FOUNDER BEHIND THE LOOP.</h2>
              <p>
                Garrett McLain built ProvisionLoop around a simple obsession: if the system keeps
                dropping the outcome between intention and execution, redesign the system.
              </p>
              <a href="/about#founder" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                Meet Garrett <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="pl-final-cta">
          <div className="site-shell pl-final-grid">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Start with one closed loop</p>
              <h2 className="pl-final-title mt-4">MAKE TONIGHT<br /><span>COUNT.</span></h2>
            </div>
            <div>
              <p className="pl-final-copy">Fund where the network can act, or choose a local kitchen already eligible to receive meal funding.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/impact" className="pl-hero-primary">Fund meals <ArrowUpRight className="size-4" /></Link>
                <Link to="/civic" className="pl-hero-secondary">View public proof</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function LiveStat({ label, value }: { label: string; value: string }) {
  return <div className="pl-live-stat"><p className="pl-live-value">{value}</p><p className="pl-live-label">{label}</p></div>;
}

function LoopNode({ number, label }: { number: string; label: string }) {
  return <div className="pl-loop-node"><span>{number}</span><i aria-hidden="true" /><strong>{label}</strong></div>;
}

function ProofStep({ number, title, body }: { number: string; title: string; body: string }) {
  return <article className="pl-proof-step"><p className="pl-proof-num">{number}</p><h3>{title}</h3><p>{body}</p></article>;
}
