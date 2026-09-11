import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChefHat,
  Home,
  Radio,
  Truck,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";

import "@/home-refresh.css";
import "@/home-experience.css";
import { ProviderStateBadge } from "@/components/ProviderStateBadge";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import galvestonMovement from "@/assets/galveston-movement-hero.webp";
import { listKitchens, loadImpactTotals } from "@/lib/community";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProvisionLoop — Hunger Needs Connection" },
      {
        name: "description",
        content:
          "ProvisionLoop connects private food need, verified kitchen capacity, sponsors and delivery into one accountable local network across Galveston County.",
      },
      {
        property: "og:title",
        content: "ProvisionLoop — Hunger doesn't need charity. It needs connection.",
      },
      {
        property: "og:description",
        content:
          "The food exists. The kitchens exist. The money exists. The help exists. ProvisionLoop connects the pieces and proves whether the loop actually closed.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

const PATHS = [
  {
    to: "/help",
    number: "01",
    icon: Home,
    title: "I need food",
    body: "Request a meal. Private by default. No public story attached.",
    action: "Request food",
  },
  {
    to: "/kitchen",
    number: "02",
    icon: UtensilsCrossed,
    title: "I run a kitchen",
    body: "Turn verified local capacity into meals for neighbors.",
    action: "Activate capacity",
  },
  {
    to: "/pilot",
    number: "03",
    icon: WalletCards,
    title: "I can fund meals",
    body: "Join the pilot now. Funding stays gated until the rail is ready.",
    action: "Support the pilot",
  },
  {
    to: "/volunteer",
    number: "04",
    icon: Truck,
    title: "I can deliver",
    body: "Be the handoff that gets a real meal to the other end.",
    action: "Move a meal",
  },
] as const;

function HomePage() {
  const impact = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const kitchens = useQuery({ queryKey: ["public-kitchens"], queryFn: listKitchens });
  const totals = impact.data;
  const latestDelivery =
    totals?.recent?.find((event) => event.kind.toLowerCase().includes("deliver")) ?? null;

  return (
    <div className="pl-home min-h-dvh">
      <SiteHeader />

      <main>
        <section className="pl-hero">
          <img
            className="pl-hero-art"
            src={galvestonMovement}
            alt="A Galveston community kitchen worker against the seawall and Gulf"
          />
          <div className="site-shell pl-hero-grid">
            <div className="pl-hero-copy">
              <div className="pl-eyebrow">
                <Radio className="size-3" /> Galveston County / founding loop
              </div>
              <h1 className="pl-hero-title">
                HUNGER DOESN&apos;T NEED CHARITY.
                <span>IT NEEDS CONNECTION.</span>
              </h1>
              <p className="pl-hero-deck">
                ProvisionLoop connects private need, verified local kitchens, sponsors, and
                delivery—then proves whether a real meal reached the other end.
              </p>
              <p className="pl-accountability-line">Money in. Meals out. Proof attached.</p>
              <div className="pl-hero-actions">
                <a href="#choose-your-lane" className="pl-hero-primary">
                  Choose your lane <ArrowRight className="size-5" />
                </a>
                <Link to="/trust-method" className="pl-hero-secondary">
                  See how it works
                </Link>
              </div>
              <p className="pl-honesty-note">
                Private. Dignified. Locally powered. Built to scale.{" "}
                {totals ? `${totals.providersMapped} providers mapped.` : ""}
              </p>
            </div>
            <div className="pl-field-note" aria-hidden="true">
              <strong>
                PROOF
                <br />
                PENDING.
              </strong>
              <span>
                NO OUTCOME
                <br />
                NO CREDIT
              </span>
            </div>
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

        <section className="pl-mealforge-spotlight" aria-labelledby="mealforge-spotlight-title">
          <div className="site-shell pl-mealforge-spotlight-grid">
            <div>
              <p className="pl-mealforge-label">
                <ChefHat className="size-4" /> The household engine inside ProvisionLoop
              </p>
              <h2 id="mealforge-spotlight-title">STOP GUESSING WHAT DINNER COSTS.</h2>
              <p>
                MealForge builds a real week of dinners around your people, allergies, pantry,
                budget, equipment and time—then turns it into one package-aware shopping list.
              </p>
              <div className="pl-mealforge-actions">
                <Link to="/mealforge" className="pl-mealforge-primary">
                  Meet MealForge <ArrowRight className="size-5" />
                </Link>
                <Link to="/app" className="pl-mealforge-secondary">
                  Open the app
                </Link>
              </div>
            </div>
            <div className="pl-mealforge-receipt" aria-label="Example MealForge plan summary">
              <div>
                <span>HOUSEHOLD</span>
                <strong>4 PEOPLE</strong>
              </div>
              <div>
                <span>WEEK</span>
                <strong>5 DINNERS</strong>
              </div>
              <div>
                <span>BUDGET</span>
                <strong>$90 MAX</strong>
              </div>
              <div>
                <span>CHECKS</span>
                <strong>ALLERGIES · PANTRY · TIME</strong>
              </div>
              <p>PLAN FIRST. SHOP ONCE. WASTE LESS.</p>
            </div>
          </div>
        </section>

        <section className="pl-section pl-why-section">
          <div className="site-shell grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <p className="pl-section-kicker">Why this exists</p>
              <h2 className="pl-section-title">
                HUNGER ISN&apos;T ONLY A SUPPLY PROBLEM. IT&apos;S A CONNECTION PROBLEM.
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-sm leading-7 opacity-70 md:text-base">
                Kitchens with capacity. Sponsors willing to help. Volunteers ready to move meals.
                Households still waiting. ProvisionLoop exists to make those pieces operate as one
                accountable local system instead of hoping they find one another by accident.
              </p>
              <p className="mt-4 text-lg font-black">
                Private need. Local capacity. Public accountability.
              </p>
              <Link
                to="/about"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary"
              >
                Why Garrett built it <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="pl-section pl-lanes-section" id="choose-your-lane">
          <div className="site-shell">
            <div className="grid items-end gap-8 md:grid-cols-[1fr_.72fr]">
              <div>
                <p className="pl-section-kicker">The loop needs one thing from you</p>
                <h2 className="pl-section-title">CHOOSE YOUR LANE.</h2>
              </div>
              <p className="max-w-lg text-sm leading-7 opacity-65 md:justify-self-end">
                You do not need to solve hunger. Own one handoff and finish it well.
              </p>
            </div>

            <div className="pl-lanes">
              {PATHS.map(({ to, number, icon: Icon, title, body, action }) => (
                <Link key={to} to={to} className="pl-lane group">
                  <span className="pl-lane-number">{number}</span>
                  <Icon className="pl-lane-icon size-7" aria-hidden="true" />
                  <span className="pl-lane-copy">
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </span>
                  <span className="pl-lane-action" aria-label={action}>
                    <ArrowRight className="size-6" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pl-section pl-proof-section">
          <div className="site-shell">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.19em] opacity-70">
              Proof, not promises
            </p>
            <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(3rem,8vw,7rem)] font-black leading-[0.84] tracking-[-0.075em]">
              SHOW THE LOOP ACTUALLY CLOSED.
            </h2>

            <div className="pl-live-strip mt-10" aria-label="Current verified outcomes">
              <LiveStat label="Funded" value={totals ? totals.mealsFunded.toLocaleString() : "—"} />
              <LiveStat
                label="Delivered"
                value={totals ? totals.mealsDelivered.toLocaleString() : "—"}
              />
              <LiveStat
                label="Ready kitchens"
                value={totals ? String(totals.fundingEnabledKitchens) : "—"}
              />
            </div>

            <div className="pl-first-loop">
              <div className="pl-first-loop-head">
                <p>VERIFIED LOOP / LATEST DELIVERY</p>
                <span>{latestDelivery ? "RECORDED" : "AWAITING FIRST VERIFIED DELIVERY"}</span>
              </div>
              {latestDelivery ? (
                <div className="pl-first-loop-body">
                  <div>
                    <span>MEALS</span>
                    <strong>{latestDelivery.meals.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>AREA</span>
                    <strong>{latestDelivery.neighborhood || "Private / aggregate only"}</strong>
                  </div>
                  <div>
                    <span>DATE</span>
                    <strong>{new Date(latestDelivery.occurred_at).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span>RECORD</span>
                    <strong>{latestDelivery.kind.replaceAll("_", " ")}</strong>
                  </div>
                </div>
              ) : (
                <div className="pl-first-loop-empty">
                  <strong>THE FIRST DELIVERY IS NOT A MARKETING STORY YET.</strong>
                  <p>
                    When a real delivery closes and enters the verified aggregate record, its
                    outcome appears here. Until then, zero stays zero.
                  </p>
                </div>
              )}
              <Link to="/civic" className="pl-first-loop-link">
                Inspect public proof <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <div className="pl-proof-grid">
              <ProofStep
                number="01"
                title="No invented impact"
                body="If a meal has not been funded and fulfilled, it does not count. Pilot numbers come from recorded outcomes, not projections."
              />
              <ProofStep
                number="02"
                title="Follow the handoff"
                body="The workflow records the movement from eligible capacity through preparation and delivery instead of stopping at a donation receipt."
              />
              <ProofStep
                number="03"
                title="Protect the person"
                body="Public proof is aggregate. The outcome can be accountable without turning somebody asking for food into content."
              />
            </div>
          </div>
        </section>

        <section className="pl-section">
          <div className="site-shell">
            <div className="grid gap-8 md:grid-cols-[1fr_.8fr] md:items-end">
              <div>
                <p className="pl-section-kicker">Local capacity</p>
                <h2 className="pl-section-title">
                  THE KITCHENS ARE REAL. THEIR STATUS SHOULD BE TOO.
                </h2>
              </div>
              <div className="md:justify-self-end">
                <p className="max-w-lg text-sm leading-7 opacity-65">
                  A mapped business is not automatically a partner. ProvisionLoop labels provider
                  status instead of making a directory look more active than it is.
                </p>
                <Link
                  to="/kitchen"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary"
                >
                  See local capacity <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="pl-network-grid">
              {(kitchens.data ?? []).slice(0, 6).map((kitchen) => (
                <div key={kitchen.id} className="pl-network-row">
                  <div className="pl-network-icon">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="pl-network-name">{kitchen.name}</p>
                    <p className="pl-network-meta">
                      {kitchen.neighborhood || kitchen.city} · {kitchen.kind.replaceAll("_", " ")}
                    </p>
                  </div>
                  <ProviderStateBadge state={kitchen.providerState} isTest={kitchen.is_test} />
                </div>
              ))}
              {kitchens.isLoading && (
                <div className="pl-network-row text-sm opacity-60">Loading mapped providers…</div>
              )}
              {!kitchens.isLoading && (kitchens.data?.length ?? 0) === 0 && (
                <div className="pl-network-row text-sm opacity-60">
                  Mapped providers will appear here as the directory grows.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pl-founder-tease" id="founder">
          <div className="site-shell pl-founder-tease-grid">
            <div className="pl-founder-tease-mark">
              <strong>GM</strong>
              <span>
                BUILT IN
                <br />
                GALVESTON
              </span>
            </div>
            <div>
              <p className="pl-section-kicker">Why Garrett built it</p>
              <h2>BUILD THE CONNECTION. PROVE THE OUTCOME. MAKE THE MODEL REPEATABLE.</h2>
              <p>
                Garrett McLain built ProvisionLoop around a simple refusal: if the food exists, the
                kitchen exists, the money exists and the help exists, hunger should not persist
                because those resources are disconnected. Galveston County is where the model gets
                proved. The system is being built so another city can eventually run the same loop
                without reinventing it from scratch.
              </p>
              <a
                href="/about#founder"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary"
              >
                Read the story <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="pl-final-cta">
          <div className="site-shell pl-final-grid">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                This is the founding loop
              </p>
              <h2 className="pl-final-title mt-4">
                THERE&apos;S A<br />
                <span>LANE FOR YOU.</span>
              </h2>
            </div>
            <div>
              <p className="pl-final-copy">
                Help prove a local system where need stays private, capacity becomes useful, and
                every claimed outcome has evidence behind it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/pilot" className="pl-hero-primary">
                  Join the founding pilot <ArrowUpRight className="size-4" />
                </Link>
                <Link to="/civic" className="pl-hero-secondary">
                  See verified proof
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

function LiveStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pl-live-stat">
      <p className="pl-live-value">{value}</p>
      <p className="pl-live-label">{label}</p>
    </div>
  );
}

function LoopNode({ number, label }: { number: string; label: string }) {
  return (
    <div className="pl-loop-node">
      <span>{number}</span>
      <i aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}

function ProofStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <article className="pl-proof-step">
      <p className="pl-proof-num">{number}</p>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
