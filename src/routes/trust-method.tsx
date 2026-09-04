import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { PROVIDER_STATE_LABEL } from "@/lib/community";
import { loadImpactTotals } from "@/lib/community";

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
    body: "A household asks for food help through a private form. The request is never published, never shown to sponsors and never attached to a name in any public view.",
  },
  {
    step: "02",
    title: "Verified partner routing",
    body: "A community partner organization reviews the request and decides where it should go, using their own eligibility and safeguarding practices — not an algorithm.",
  },
  {
    step: "03",
    title: "Kitchen capacity",
    body: "A claimed operator with open capacity accepts the order at their own posted cost per meal. ProvisionLoop does not set or mark up that price.",
  },
  {
    step: "04",
    title: "Volunteer & dispatch",
    body: "Prep shifts and delivery runs are published to volunteers with drop points, not household addresses. Volunteers see only what they need to complete the run.",
  },
  {
    step: "05",
    title: "Fulfillment verification",
    body: "The kitchen marks the order prepared, the run is completed, and only then does the order close and the kitchen payout queue.",
  },
  {
    step: "06",
    title: "Aggregate civic ledger",
    body: "The closed order writes one impact event with meals, neighborhood and time. Cities and sponsors see aggregates; nobody sees a recipient.",
  },
] as const;

const STATES = [
  {
    key: "directory" as const,
    detail:
      "A real local food program we mapped from public information so people can find help. The organization has not partnered with, endorsed or joined ProvisionLoop, receives no money through the platform and cannot be selected for funding.",
  },
  {
    key: "verified" as const,
    detail:
      "Someone who operates the organization claimed the listing and controls its details, capacity and meal cost. Claiming alone does not move money.",
  },
  {
    key: "funding_enabled" as const,
    detail:
      "A claimed operator that also completed payout onboarding with our payment processor. This is the only state in which a provider can be funded — enforced on the server for every one-time and recurring checkout path, not just hidden in the interface.",
  },
];

const NOT_CLAIMED = [
  "We do not claim any listed organization is a partner, sponsor or affiliate unless its operator claimed the listing.",
  "We do not claim tax-deductible donation status, charitable registration or nonprofit status for ProvisionLoop or for funds moved through it.",
  "We do not claim certifications, audits, food-safety accreditation or regulatory approval.",
  "We do not publish estimated, projected or illustrative impact numbers. Every meal count on this site comes from a closed ledger event.",
  "We do not claim outcomes beyond fulfillment — a delivered meal is a delivered meal, not a measured change in food security.",
  "We do not sell, share or publish household data, and we do not name recipients anywhere, ever.",
];

const LIMITS = [
  "This is a Galveston County pilot. Coverage is partial and most mapped providers are still unclaimed directory listings.",
  "Funding, dispatch and payout flows are live but low-volume; expect gaps in nights, weekends and rural coverage.",
  "Directory details are compiled from public sources and can go stale. Hours and eligibility should be confirmed with the organization directly.",
  "Civic figures are aggregates from a small ledger and are not a substitute for a county needs assessment.",
];

function TrustMethodPage() {
  const totals = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const t = totals.data;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="site-shell py-14 md:py-20">
          <p className="kicker text-primary">Trust &amp; method</p>
          <h1 className="display-title mt-5 max-w-5xl text-5xl md:text-7xl">
            HOW THIS ACTUALLY WORKS.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            ProvisionLoop is local food infrastructure: a coordination layer that connects private
            household requests, verified community partners, paid local kitchen capacity, volunteer
            dispatch and a public aggregate ledger into one accountable loop. It is not a donation
            marketplace, a charity brand or a feel-good campaign. This page explains exactly what we
            operate, what we count, and what we refuse to claim.
          </p>

          <div className="mt-10 grid border-2 border-foreground sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Providers mapped" value={t ? String(t.providersMapped) : "—"} />
            <Fact label="Operator verified" value={t ? String(t.verifiedOperators) : "—"} />
            <Fact
              label="Funding-enabled kitchens"
              value={t ? String(t.fundingEnabledKitchens) : "—"}
            />
            <Fact label="Meals delivered (ledger)" value={t ? String(t.mealsDelivered) : "—"} />
          </div>
        </section>

        <section className="section-rule bg-secondary text-secondary-foreground">
          <div className="site-shell py-16">
            <p className="kicker">The loop</p>
            <h2 className="display-title mt-4 max-w-4xl text-4xl md:text-6xl">
              REQUEST TO LEDGER, WITHOUT EXPOSING ANYONE.
            </h2>
            <div className="mt-10 grid gap-px border-2 border-foreground bg-foreground md:grid-cols-2 lg:grid-cols-3">
              {LOOP.map((s) => (
                <div key={s.step} className="bg-background p-6 text-foreground">
                  <span className="kicker text-primary">{s.step}</span>
                  <h3 className="mt-3 font-display text-xl font-black">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell py-16">
          <p className="kicker text-primary">Provider verification states</p>
          <h2 className="display-title mt-4 text-4xl md:text-6xl">THREE STATES. NO BLUR.</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {STATES.map((s) => (
              <article key={s.key} className="editorial-card p-6">
                <span className="kicker border border-border-strong px-2 py-1 text-[10px]">
                  {PROVIDER_STATE_LABEL[s.key]}
                </span>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{s.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
            Unclaimed listings stay visible in{" "}
            <Link to="/help" className="underline underline-offset-4">
              Find food
            </Link>{" "}
            and in civic planning views because discovery helps people. They are simply never
            selectable for funding, and attempting to fund one is rejected by the server with{" "}
            <span className="font-mono text-xs">“This kitchen is not yet accepting funding.”</span>
          </p>
        </section>

        <section className="section-rule bg-card">
          <div className="site-shell grid gap-10 py-16 lg:grid-cols-2">
            <div>
              <p className="kicker text-primary">How impact counts are created</p>
              <h2 className="mt-4 font-display text-3xl font-black">A meal counts once, late.</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Funded</strong> is written only after the
                  payment provider confirms a completed payment through a signed webhook. Pledges,
                  intents and abandoned checkouts count for nothing.
                </li>
                <li>
                  <strong className="text-foreground">Delivered</strong> is written only when the
                  kitchen and dispatch workflow closes the order.
                </li>
                <li>
                  Every public number on this site is a sum of those ledger rows. There are no demo,
                  seeded or projected impact figures anywhere in the totals.
                </li>
                <li>
                  Kitchen payouts are queued from the same delivery event, so money out is tied to
                  fulfillment rather than to promises.
                </li>
              </ul>
            </div>
            <div>
              <p className="kicker text-primary">Recipient privacy boundary</p>
              <h2 className="mt-4 font-display text-3xl font-black">Sponsors never see people.</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>Household requests are readable only by the household and routing partners.</li>
                <li>
                  Sponsors, kitchens and cities receive neighborhood-level aggregates — no names,
                  addresses, household composition or request text.
                </li>
                <li>
                  Volunteers see drop points and run instructions, not household identity, and only
                  for runs they claim.
                </li>
                <li>Impact events store meals, kind, neighborhood and time. Nothing else.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="site-shell py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="kicker text-primary">Payments &amp; environment status</p>
              <h2 className="mt-4 font-display text-3xl font-black">
                Where the money is right now.
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  Payments run through Stripe. Card details never touch ProvisionLoop servers, and
                  secret keys are used only in server-side code.
                </li>
                <li>
                  Preview and test environments process simulated payments and display a test-mode
                  banner above the funding screen. Live and test records are stored separately.
                </li>
                <li>
                  Kitchen payouts require the operator to complete Stripe payout onboarding. Until
                  that is done, the provider is not funding-enabled anywhere on the site.
                </li>
                <li>
                  Recurring sponsorships are paused while no kitchen in the network is
                  funding-enabled, rather than collecting money we cannot route.
                </li>
              </ul>
            </div>
            <div>
              <p className="kicker text-primary">What we do not claim</p>
              <h2 className="mt-4 font-display text-3xl font-black">The honest list.</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                {NOT_CLAIMED.map((c) => (
                  <li key={c} className="border-l-2 border-border-strong pl-4">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-rule bg-card">
          <div className="site-shell py-16">
            <p className="kicker text-primary">Pilot limitations</p>
            <h2 className="display-title mt-4 text-4xl md:text-5xl">WHAT IS STILL MISSING.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {LIMITS.map((l) => (
                <p key={l} className="editorial-card p-5 text-sm leading-6 text-muted-foreground">
                  {l}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell py-16">
          <div className="editorial-card grid gap-6 p-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="kicker text-primary">For listed organizations</p>
              <h2 className="mt-4 font-display text-3xl font-black">
                Claim, correct or remove your listing.
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                If your organization appears in our directory, it was added from public information
                to help neighbors find food — not because you signed up. You can take control of the
                listing, fix any detail, or have it removed entirely. Removal requests are honored
                without argument and without requiring you to explain why.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">Claim it:</strong> start the operator claim in
                  the kitchen network and we verify you run the organization before handing over
                  control.
                </li>
                <li>
                  <strong className="text-foreground">Correct or remove it:</strong> email{" "}
                  <a
                    className="text-primary underline underline-offset-4"
                    href="mailto:listings@provisionloop.org?subject=Directory%20listing%20correction%20or%20removal"
                  >
                    listings@provisionloop.org
                  </a>{" "}
                  from an address at your organization with the listing name and the change you
                  want.
                </li>
              </ul>
            </div>
            <div className="grid gap-3">
              <Link to="/kitchen" className="button-primary justify-center py-4">
                Claim a listing
              </Link>
              <a
                className="button-secondary justify-center py-4"
                href="mailto:listings@provisionloop.org?subject=Directory%20listing%20correction%20or%20removal"
              >
                Request a correction or removal
              </a>
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
    <div className="border-b-2 border-foreground p-6 last:border-b-0 sm:border-r-2 sm:last:border-r-0">
      <p className="font-display text-4xl font-black">{value}</p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
