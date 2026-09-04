import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  ChefHat,
  HandHeart,
  MapPin,
  ReceiptText,
  Users,
} from "lucide-react";

import heroTable from "@/assets/hero-table.jpg";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { ProviderStateBadge } from "@/components/ProviderStateBadge";
import { listKitchens, loadImpactTotals } from "@/lib/community";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProvisionLoop — Fund Local Meals in Galveston County" },
      {
        name: "description",
        content:
          "Accountable local food infrastructure in Galveston County: fund verified kitchens, find nearby food support, volunteer for dispatch and follow every delivery on a public ledger.",
      },
      { property: "og:title", content: "ProvisionLoop — Local meals. Public proof." },
      {
        property: "og:description",
        content:
          "Closed-loop community food coordination: verified kitchens, volunteer dispatch and a public aggregate ledger.",
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
    title: "Fund local meals",
    body: "Send funding to a kitchen whose operator has verified the listing and enabled payouts.",
    action: "Fund a meal",
  },
  {
    to: "/help",
    number: "02",
    icon: MapPin,
    title: "Find food help",
    body: "See nearby Galveston County programs, service details and trusted ways to ask for assistance.",
    action: "Find support",
  },
  {
    to: "/kitchen",
    number: "03",
    icon: ChefHat,
    title: "Put your kitchen to work",
    body: "Restaurants, churches, caterers and community kitchens can turn open capacity into funded orders.",
    action: "Join the network",
  },
  {
    to: "/volunteer",
    number: "04",
    icon: Users,
    title: "Move meals nearby",
    body: "Browse local prep shifts and delivery runs. Create an account only when you are ready to claim one.",
    action: "See opportunities",
  },
] as const;

function HomePage() {
  const impact = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const kitchens = useQuery({ queryKey: ["public-kitchens"], queryFn: listKitchens });
  const totals = impact.data;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="overflow-hidden border-b-2 border-foreground">
          <div className="site-shell grid min-h-[calc(100dvh-72px)] items-stretch lg:grid-cols-[1.08fr_.92fr]">
            <div className="flex flex-col justify-center py-16 pr-0 lg:py-24 lg:pr-14">
              <div className="kicker flex items-center gap-2 text-primary">
                <span className="size-2 rounded-full bg-primary" /> Galveston County pilot
              </div>
              <h1 className="display-title mt-7 max-w-[10ch] text-[clamp(3.7rem,9vw,7.6rem)]">
                GOOD FOOD.
                <br />
                <span className="text-primary">LOCAL POWER.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-muted-foreground md:text-xl">
Accountable local food infrastructure: private requests route through verified partners,
                paid local kitchen capacity, and volunteer dispatch — then close on a public ledger.
                Not a donation marketplace. A coordination loop that finishes.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/impact" className="button-primary px-6 py-4">
                  Fund meals now <ArrowRight className="size-4" />
                </Link>
                <Link to="/help" className="button-secondary px-6 py-4">
                  I need food help
                </Link>
              </div>
              <div className="mt-12 grid grid-cols-3 border-y border-border-strong">
                <LiveStat
                  label="Meals funded"
                  value={totals ? totals.mealsFunded.toLocaleString() : "—"}
                />
                <LiveStat
                  label="Delivered"
                  value={totals ? totals.mealsDelivered.toLocaleString() : "—"}
                />
                <LiveStat
                  label="Funding-enabled kitchens"
                  value={totals ? String(totals.fundingEnabledKitchens) : "—"}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Live pilot totals from the public ProvisionLoop ledger — no demo numbers.{" "}
                {totals ? `${totals.providersMapped} providers mapped in the directory; ` : ""}
                only funding-enabled kitchens can receive money.{" "}
                <Link to="/trust-method" className="underline underline-offset-4">
                  Trust &amp; method
                </Link>
              </p>
            </div>

            <div className="relative min-h-[520px] border-x-2 border-t-2 border-foreground lg:min-h-full lg:border-y-0 lg:border-r-2">
              <img
                src={heroTable}
                alt="Neighbors sharing food around one long table"
                className="absolute inset-0 size-full object-cover saturate-[.85]"
                width={1024}
                height={1024}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 bg-secondary px-4 py-3 font-mono text-xs font-semibold text-secondary-foreground shadow-[4px_4px_0_var(--foreground)]">
                FOOD IS INFRASTRUCTURE.
              </div>
              <div className="absolute inset-x-5 bottom-5 grid gap-2 bg-background p-5 text-foreground shadow-[6px_6px_0_var(--primary)] sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="kicker text-primary">The promise</p>
                  <p className="mt-2 font-display text-2xl font-black leading-tight">
                    Every funded meal creates food access and local kitchen revenue.
                  </p>
                </div>
                <ReceiptText className="hidden size-10 text-primary sm:block" />
              </div>
            </div>
          </div>
        </section>

        <section className="site-shell py-20">
          <div className="grid items-end gap-6 md:grid-cols-2">
            <div>
              <p className="kicker text-primary">Choose your lane</p>
              <h2 className="display-title mt-4 text-5xl md:text-6xl">WHAT ARE YOU HERE TO DO?</h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-muted-foreground md:justify-self-end">
              No maze of dashboards. Start with the outcome you need and ProvisionLoop routes you
              into the right workflow.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {PATHS.map(({ to, number, icon: Icon, title, body, action }) => (
              <Link
                key={to}
                to={to}
                className="group editorial-card grid min-h-64 p-6 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--primary)] md:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="kicker">{number}</span>
                  <Icon className="size-8 text-primary" />
                </div>
                <div className="mt-auto pt-12">
                  <h3 className="font-display text-3xl font-black tracking-tight">{title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                    {action}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-rule bg-secondary text-secondary-foreground">
          <div className="site-shell py-20">
            <p className="kicker">One accountable loop</p>
            <h2 className="display-title mt-4 max-w-4xl text-5xl md:text-7xl">
              MONEY IN. MEALS OUT. PROOF ATTACHED.
            </h2>
            <div className="mt-12 grid border-2 border-foreground bg-background text-foreground md:grid-cols-3">
              <Step
                number="1"
                title="A neighbor funds"
                body="One-time and monthly funding is tied to a real kitchen cost—not an invented donation estimate."
              />
              <Step
                number="2"
                title="A kitchen fulfills"
                body="The kitchen accepts, prepares and releases the order into a tracked delivery workflow."
              />
              <Step
                number="3"
                title="The ledger closes"
                body="Delivery creates the impact event and queues the kitchen payout without exposing recipients."
              />
            </div>
          </div>
        </section>

        <section className="site-shell py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker text-primary">Galveston network</p>
              <h2 className="display-title mt-4 text-5xl md:text-6xl">LOCAL CAPACITY, VISIBLE.</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Mapped providers, labeled honestly. Directory listings are real local programs we
                mapped for discovery — they are not affiliated with ProvisionLoop and cannot be
                funded here.
              </p>
            </div>
            <Link to="/kitchen" className="button-secondary">
              View all kitchens <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            {(kitchens.data ?? []).slice(0, 6).map((kitchen) => (
              <div
                key={kitchen.id}
                className="flex items-center gap-4 border-b border-border-strong py-5"
              >
                <div className="grid size-12 shrink-0 place-items-center bg-foreground text-background">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-extrabold">{kitchen.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {kitchen.neighborhood || kitchen.city} · {kitchen.kind.replaceAll("_", " ")}
                  </p>
                </div>
                <ProviderStateBadge state={kitchen.providerState} />
              </div>
            ))}
            {kitchens.isLoading && (
              <p className="text-sm text-muted-foreground">Loading mapped providers…</p>
            )}
            {!kitchens.isLoading && (kitchens.data?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">
Mapped providers will appear here as the directory grows.
              </p>
            )}
          </div>
        </section>

        <section className="section-rule bg-primary text-primary-foreground">
          <div className="site-shell grid gap-8 py-16 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="kicker">Start with one meal</p>
              <h2 className="display-title mt-4 max-w-4xl text-5xl md:text-7xl">
                MAKE TONIGHT COUNT.
              </h2>
              <p className="mt-5 max-w-xl text-base font-semibold leading-7 opacity-80">
                Fund where the need is highest, or choose the local kitchen you want to support.
              </p>
            </div>
            <Link to="/impact" className="button-secondary bg-background px-8 py-5 text-foreground">
              Fund meals <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function LiveStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-border-strong py-4 pr-2 last:border-r-0 last:pl-4 [&:nth-child(2)]:pl-4">
      <p className="font-display text-2xl font-black md:text-3xl">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="border-b-2 border-foreground p-7 last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0">
      <div className="grid size-10 place-items-center rounded-full bg-primary font-display text-lg font-black text-primary-foreground">
        {number}
      </div>
      <h3 className="mt-8 font-display text-2xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
