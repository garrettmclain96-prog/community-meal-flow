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
import "@/home-experience.css";
import { ProviderStateBadge } from "@/components/ProviderStateBadge";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { listKitchens, loadImpactTotals } from "@/lib/community";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProvisionLoop — Close the Gap Between Help and a Meal" },
      {
        name: "description",
        content:
          "ProvisionLoop connects local food need, kitchen capacity, funding and delivery into one accountable chain across Galveston County — then shows whether the loop actually closed.",
      },
      { property: "og:title", content: "ProvisionLoop — Good intentions aren't enough. Execution matters." },
      {
        property: "og:description",
        content:
          "The food exists. The kitchen exists. The help exists. ProvisionLoop closes the gap and makes the outcome accountable.",
      },
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
    title: "Fund a meal",
    body: "Put money behind verified local capacity. Follow the outcome instead of losing it at checkout.",
    action: "Fund the next meal",
  },
  {
    to: "/help",
    number: "02",
    icon: MapPin,
    title: "I need food",
    body: "Make one private request and enter the local support flow without turning your need into public content.",
    action: "Request help",
  },
  {
    to: "/kitchen",
    number: "03",
    icon: ChefHat,
    title: "I run a kitchen",
    body: "Turn usable capacity into funded meals. You cook. ProvisionLoop coordinates the rest of the loop.",
    action: "Activate capacity",
  },
  {
    to: "/volunteer",
    number: "04",
    icon: Users,
    title: "I can deliver",
    body: "Claim local work that moves a meal from the kitchen to the person waiting on the other end.",
    action: "Close the loop",
  },
] as const;

function HomePage() {
  const impact = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const kitchens = useQuery({ queryKey: ["public-kitchens"], queryFn: listKitchens });
  const totals = impact.data;
  const latestDelivery = totals?.recent?.find((event) => event.kind.toLowerCase().includes("deliver")) ?? null;

  return (
    <div className="pl-home min-h-dvh">
      <SiteHeader />

      <main>
        <section className="pl-hero">
          <div className="site-shell pl-hero-grid">
            <div className="pl-hero-copy">
              <div className="pl-eyebrow text-primary"><Radio className="size-3" /> Galveston County pilot</div>
              <h1 className="pl-hero-title">
                THE FOOD EXISTS.<br />
                THE KITCHEN EXISTS.<br />
                THE HELP EXISTS.<br />
                <span>SO WHY IS SOMEONE STILL HUNGRY?</span>
              </h1>
              <p className="pl-hero-deck">
                Someone needs dinner. A local kitchen can make it. Someone is willing to pay for it.
                Someone can deliver it. Those people should not have to find each other by accident.
                ProvisionLoop closes the gap — and tracks whether the meal actually reached the other end.
              </p>

              <div className="pl-hero-actions">
                <Link to="/impact" className="pl-hero-primary">
                  Fund the next meal <ArrowUpRight className="size-4" />
                </Link>
                <Link to="/trust-method" className="pl-hero-secondary">
                  See how it works <ArrowRight className="size-4" />
                </Link>
              </div>

              <p className="mt-4 max-w-xl font-mono text-[10px] uppercase leading-5 tracking-[0.08em] text-[#777269]">
                Verified pilot totals only. No projections. No demo numbers. {totals ? `${totals.providersMapped} providers mapped. ` : ""}
                <Link to="/trust-method" className="text-primary underline underline-offset-4">
                  Check the method
                </Link>
              </p>
            </div>

            <aside className="pl-dispatch-board" aria-label="ProvisionLoop live dispatch board">
              <div className="pl-dispatch-head">
                <div>
                  <p>DISPATCH / GALVESTON COUNTY</p>
                  <strong>LIVE PILOT</strong>
                </div>
                <span><i aria-hidden="true" /> ACTIVE</span>
              </div>

              <div className="pl-dispatch-main">
                <p className="pl-dispatch-kicker">The next loop</p>
                <h2>FOUR HANDOFFS.<br /><span>ONE OUTCOME.</span></h2>
                <div className="pl-dispatch-rows">
                  <DispatchRow number="01" label="NEED" value="Private by default" state="PROTECTED" />
                  <DispatchRow number="02" label="CAPACITY" value="Verified kitchens only" state="CHECKED" />
                  <DispatchRow number="03" label="FUNDING" value="Eligible capacity only" state="TRACEABLE" />
                  <DispatchRow number="04" label="DELIVERY" value="Tracked to completion" state="CLOSES LOOP" />
                </div>
              </div>

              <div className="pl-dispatch-metrics">
                <DispatchMetric label="Funded" value={totals ? totals.mealsFunded.toLocaleString() : "—"} />
                <DispatchMetric label="Delivered" value={totals ? totals.mealsDelivered.toLocaleString() : "—"} />
                <DispatchMetric label="Ready kitchens" value={totals ? String(totals.fundingEnabledKitchens) : "—"} />
              </div>

              <div className="pl-dispatch-foot">
                <ShieldCheck className="size-4" />
                <span>NO OUTCOME = NO CREDIT</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="pl-loop-rail" aria-label="How ProvisionLoop closes the loop">
          <div className="site-shell pl-loop-rail-grid">
            <LoopNode number="01" label="Need enters privately" />
            <LoopNode number="02" label="Capacity gets verified" />
            <LoopNode number="03" label="Money + people move" />
            <LoopNode number="04" label="The outcome gets proved" />
          </div>
        </section>

        <section className="pl-section pl-why-section">
          <div className="site-shell grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <p className="pl-section-kicker">Why this exists</p>
              <h2 className="pl-section-title">CARING ISN&apos;T A DELIVERY SYSTEM.</h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-sm leading-7 opacity-70 md:text-base">
                Kitchens with capacity. Funding ready to move. People willing to help. People still
                hungry. The failure was not a lack of generosity. It was the silence between all of
                those pieces — the point where intention was supposed to become dinner.
              </p>
              <p className="mt-4 text-lg font-black">Not anymore.</p>
              <Link to="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                Why Garrett built it <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="pl-section">
          <div className="site-shell">
            <div className="grid items-end gap-8 md:grid-cols-[1fr_.72fr]">
              <div>
                <p className="pl-section-kicker">Choose what you can do</p>
                <h2 className="pl-section-title">FOUR COMMITMENTS. ONE CLOSED LOOP.</h2>
              </div>
              <p className="max-w-lg text-sm leading-7 opacity-65 md:justify-self-end">
                Do not browse a platform. Pick the part of the job you can finish and move the next
                meal one step closer to the other end.
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

        <section className="pl-section pl-proof-section">
          <div className="site-shell">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.19em] opacity-70">Proof, not promises</p>
            <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(3rem,8vw,7rem)] font-black leading-[0.84] tracking-[-0.075em]">
              SHOW THE LOOP ACTUALLY CLOSED.
            </h2>

            <div className="pl-live-strip mt-10" aria-label="Current verified outcomes">
              <LiveStat label="Funded" value={totals ? totals.mealsFunded.toLocaleString() : "—"} />
              <LiveStat label="Delivered" value={totals ? totals.mealsDelivered.toLocaleString() : "—"} />
              <LiveStat label="Ready kitchens" value={totals ? String(totals.fundingEnabledKitchens) : "—"} />
            </div>

            <div className="pl-first-loop">
              <div className="pl-first-loop-head">
                <p>VERIFIED LOOP / LATEST DELIVERY</p>
                <span>{latestDelivery ? "RECORDED" : "AWAITING FIRST VERIFIED DELIVERY"}</span>
              </div>
              {latestDelivery ? (
                <div className="pl-first-loop-body">
                  <div><span>MEALS</span><strong>{latestDelivery.meals.toLocaleString()}</strong></div>
                  <div><span>AREA</span><strong>{latestDelivery.neighborhood || "Private / aggregate only"}</strong></div>
                  <div><span>DATE</span><strong>{new Date(latestDelivery.occurred_at).toLocaleDateString()}</strong></div>
                  <div><span>RECORD</span><strong>{latestDelivery.kind.replaceAll("_", " ")}</strong></div>
                </div>
              ) : (
                <div className="pl-first-loop-empty">
                  <strong>THE FIRST DELIVERY IS NOT A MARKETING STORY YET.</strong>
                  <p>
                    When a real delivery closes and enters the verified aggregate record, its outcome
                    appears here. Until then, zero stays zero.
                  </p>
                </div>
              )}
              <Link to="/civic" className="pl-first-loop-link">Inspect public proof <ArrowUpRight className="size-4" /></Link>
            </div>

            <div className="pl-proof-grid">
              <ProofStep number="01" title="No invented impact" body="If a meal has not been funded and fulfilled, it does not count. Pilot numbers come from recorded outcomes, not projections." />
              <ProofStep number="02" title="Follow the handoff" body="The workflow records the movement from eligible capacity through preparation and delivery instead of stopping at a donation receipt." />
              <ProofStep number="03" title="Protect the person" body="Public proof is aggregate. The outcome can be accountable without turning somebody asking for food into content." />
            </div>
          </div>
        </section>

        <section className="pl-section">
          <div className="site-shell">
            <div className="grid gap-8 md:grid-cols-[1fr_.8fr] md:items-end">
              <div>
                <p className="pl-section-kicker">Local capacity</p>
                <h2 className="pl-section-title">THE KITCHENS ARE REAL. THEIR STATUS SHOULD BE TOO.</h2>
              </div>
              <div className="md:justify-self-end">
                <p className="max-w-lg text-sm leading-7 opacity-65">
                  A mapped business is not automatically a partner. ProvisionLoop labels provider
                  status instead of making a directory look more active than it is.
                </p>
                <Link to="/kitchen" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary">
                  See local capacity <ArrowUpRight className="size-4" />
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

        <section className="pl-founder-tease" id="founder">
          <div className="site-shell pl-founder-tease-grid">
            <div className="pl-founder-tease-mark"><Fingerprint className="size-8" /><strong>GM</strong></div>
            <div>
              <p className="pl-section-kicker">Why Garrett built it</p>
              <h2>I WON&apos;T LET GOOD INTENTIONS FAIL AT EXECUTION.</h2>
              <p>
                Garrett McLain built ProvisionLoop after seeing the same failure hiding in plain
                sight: the resources existed, the willingness existed, and the outcome still got
                dropped somewhere between intention and action. ProvisionLoop is the refusal to
                accept that gap as normal.
              </p>
              <a href="/about#founder" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                Read the story <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="pl-final-cta">
          <div className="site-shell pl-final-grid">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The movement is simple</p>
              <h2 className="pl-final-title mt-4">CLOSE THE<br /><span>NEXT LOOP.</span></h2>
            </div>
            <div>
              <p className="pl-final-copy">Do one concrete thing that moves a meal toward the person waiting for it.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/impact" className="pl-hero-primary">Fund the next meal <ArrowUpRight className="size-4" /></Link>
                <Link to="/civic" className="pl-hero-secondary">See verified proof</Link>
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

function DispatchRow({ number, label, value, state }: { number: string; label: string; value: string; state: string }) {
  return (
    <div className="pl-dispatch-row">
      <span>{number}</span>
      <strong>{label}</strong>
      <p>{value}</p>
      <em>{state}</em>
    </div>
  );
}

function DispatchMetric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function ProofStep({ number, title, body }: { number: string; title: string; body: string }) {
  return <article className="pl-proof-step"><p className="pl-proof-num">{number}</p><h3>{title}</h3><p>{body}</p></article>;
}
