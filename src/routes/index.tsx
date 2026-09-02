import { createFileRoute, Link } from "@tanstack/react-router";
import heroTable from "@/assets/hero-table.jpg";
import cityMap from "@/assets/city-map.jpg";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { DisplayControls } from "@/components/DisplayControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapHotspot } from "@/components/MapHotspot";
import { AccountButton } from "@/components/AccountButton";
import { DISPATCHES } from "@/data/dispatches";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TableForward — Live Food Security Infrastructure" },
      {
        name: "description",
        content:
          "A real-time, transparent community funding engine. Fund meals, stabilize local kitchens, and watch every dollar land on a public ledger.",
      },
      { property: "og:title", content: "TableForward — Live Food Security Infrastructure" },
      {
        property: "og:description",
        content:
          "Fund a meal. Stabilize a kitchen. Feed a neighborhood — on a live, public ledger.",
      },
      { property: "og:image", content: heroTable },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function LiveDot() {
  return (
    <span className="relative inline-flex size-2">
      <span className="absolute inline-flex size-full rounded-full bg-ember animate-ember-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-ember" />
    </span>
  );
}

const NAV = [
  { to: "/app", label: "MealForge" },
  { to: "/impact", label: "Fund Meals" },
  { to: "/kitchen", label: "Kitchens" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/partners", label: "Partners" },
  { to: "/civic", label: "Civic" },
] as const;

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full glass border-x-0 border-t-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-9">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Table<span className="aurora-text">Forward</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="transition-colors hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <DisplayControls surface="site photography" className="hidden xl:inline-flex" />
          <ThemeToggle />
          <AccountButton />
          <Link
            to="/impact"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_40px_-12px_var(--ember-glow)] transition-all hover:scale-[1.03]"
          >
            Fund a Meal
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Tile({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`bento p-6 ${className}`}>{children}</div>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      {children}
    </p>
  );
}

function HeroBento() {
  return (
    <section className="aurora-field relative overflow-hidden px-6 pb-16 pt-10">
      <PhotoBackdrop
        className="-z-10"
        src={heroTable}
        alt="A communal table lit by warm lights, families sharing a meal together"
        imgClassName="animate-flicker"
        width={1280}
        height={960}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" aria-hidden="true" />
      </PhotoBackdrop>

      <div className="mx-auto grid max-w-7xl auto-rows-min grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
        {/* Headline tile */}
        <Tile className="animate-slide-up md:col-span-6 lg:col-span-8 lg:row-span-2 flex flex-col justify-between gap-8 p-8 md:p-10">
          <div>
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
              <LiveDot />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-text">
                Live network · 128 cities operational
              </span>
            </div>
            <h1 className="text-balance font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
              Infrastructure for{" "}
              <span className="aurora-text">human security</span>.
            </h1>
            <p className="mt-6 max-w-[52ch] text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              TableForward turns everyday generosity into a verifiable supply chain:
              fund a meal, stabilize a neighborhood kitchen, and watch the delivery
              land on a public ledger in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/impact"
              className="group rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_20px_60px_-20px_var(--ember-glow)] transition-all hover:scale-[1.02]"
            >
              Fund a Neighborhood
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/app"
              className="rounded-full border border-border-strong px-7 py-3.5 text-sm font-semibold transition-colors hover:border-ember hover:text-ember-text"
            >
              Plan my household meals
            </Link>
          </div>
        </Tile>

        {/* Big counter */}
        <Tile className="animate-slide-up md:col-span-3 lg:col-span-4 grain">
          <div className="flex items-center justify-between">
            <Eyebrow>Aggregate impact</Eyebrow>
            <LiveDot />
          </div>
          <div className="mt-4 font-display text-5xl font-bold tracking-tight aurora-text lg:text-6xl">
            482,901
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Meals delivered since Jan 2024</p>
          <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-[11px]">
            {[
              ["CITIES", "128"],
              ["REV FLOOR", "$12.4M"],
              ["FAMILIES/WK", "8,201"],
              ["AVG DELIVERY", "14.2m"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border px-3 py-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
                <div className="mt-0.5 text-sm font-medium text-foreground">{v}</div>
              </div>
            ))}
          </div>
        </Tile>

        {/* Ledger ticker */}
        <Tile className="animate-slide-up md:col-span-3 lg:col-span-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <Eyebrow>Live ledger</Eyebrow>
            <span className="font-mono text-[10px] text-ember-text">streaming</span>
          </div>
          <div className="relative mt-4 h-40 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]">
            <div className="animate-ticker space-y-2.5">
              {[...LEDGER, ...LEDGER].map((row, i) => (
                <div key={i} className="flex gap-3 font-mono text-[11px] text-muted-foreground">
                  <span className="text-ember-text">{row[0]}</span>
                  <span className="truncate">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </Tile>
      </div>
    </section>
  );
}

const LEDGER: Array<[string, string]> = [
  ["14:21", "Batch #982 → North Oak Family Center"],
  ["14:18", "TechCorp funded 500 meals · Ward 4"],
  ["14:15", "St. Jude kitchens synced · Ward 4"],
  ["14:11", "12 meals delivered · Riverside Seniors"],
  ["14:04", "Payout released · Isle Market Kitchen"],
  ["13:58", "Volunteer run claimed · Route 7"],
];

function HowBento() {
  const steps = [
    ["01", "Anyone funds a meal", "Every dollar is tied to one trackable meal — never a black-box donation pool."],
    ["02", "Smart matching routes it", "Funding is matched to verified local kitchens based on live neighborhood demand."],
    ["03", "Partners deliver it", "Nonprofits and volunteers route meals to families. Receipts post on-ledger."],
  ];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <Eyebrow>00 — How the engine works</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
            A live, transparent, <span className="aurora-text">community-powered</span> food security engine.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(([n, t, b]) => (
            <Tile key={n} className="p-8">
              <div className="font-mono text-xs text-ember-text">{n}</div>
              <h3 className="mt-5 font-display text-xl font-semibold">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b}</p>
            </Tile>
          ))}
        </div>
      </div>
    </section>
  );
}

function StabilizationBento() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow>01 — The stabilization engine</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
              We remove the volatility of running a <span className="aurora-text">local kitchen</span>.
            </h2>
          </div>
          <div className="flex gap-3">
            {[["1,402", "Active kitchens"], ["98.4%", "Retention"]].map(([v, l]) => (
              <div key={l} className="bento px-5 py-4 text-center">
                <div className="font-display text-2xl font-bold text-ember-text">{v}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Tile className="grain lg:col-span-2 p-8">
            <div className="flex items-center justify-between border-b border-border pb-4 font-mono text-[11px]">
              <span className="tracking-wider">KITCHEN_PARTNER_042 // REVENUE</span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <LiveDot /> REFRESH 12.0s
              </span>
            </div>
            <div className="relative mt-8 flex h-56 items-end gap-2.5">
              {[[55, 38], [70, 42], [60, 30], [78, 50], [55, 48], [82, 60], [65, 45], [90, 70], [72, 55]].map(
                ([organic, floor], i) => (
                  <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
                    <div
                      className="rounded-t-md bg-violet/40"
                      style={{ height: `${organic}%` }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-md bg-ember shadow-[0_-2px_24px_var(--ember-glow)]"
                      style={{ height: `${floor}%` }}
                    />
                  </div>
                ),
              )}
              <div className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-dashed border-foreground/50">
                <span className="absolute -top-4 right-0 bg-surface-elevated px-1 font-mono text-[9px]">
                  GUARANTEED_FLOOR
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5 font-mono text-[11px]">
              {[
                ["Predicted vol.", "1,240 meals", ""],
                ["Direct funding", "$18,490.00", ""],
                ["Labor subsidy", "+ $2,400.00", "text-ember-text"],
              ].map(([l, v, c]) => (
                <div key={l}>
                  <div className="uppercase text-muted-foreground">{l}</div>
                  <div className={`mt-1 text-sm font-medium ${c || "text-foreground"}`}>{v}</div>
                </div>
              ))}
            </div>
          </Tile>

          <div className="grid gap-4">
            {[
              ["Guaranteed daily revenue", "Purchase agreements that cover overhead before the first walk-in."],
              ["Micro-grants & supplies", "Discounted ingredients, equipment grants, kitchen upgrades."],
              ["Volunteer labor pool", "On-demand prep help routed by the network during peak hours."],
            ].map(([t, b]) => (
              <Tile key={t} className="p-5">
                <div className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ember shadow-[0_0_12px_var(--ember-glow)]" />
                  <div>
                    <h4 className="text-sm font-semibold">{t}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b}</p>
                  </div>
                </div>
              </Tile>
            ))}
            <Link
              to="/kitchen"
              className="rounded-xl bg-foreground px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Apply as a kitchen partner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PulseBento() {
  const metrics = [
    { label: "Neighborhoods", value: "42", note: "85% city coverage", pct: 85 },
    { label: "Families supported", value: "8,201", note: "Active this week", pct: 62 },
    { label: "Meals today", value: "1,482", note: "Target 1,600 / day", pct: 92 },
    { label: "Corporate match", value: "4.2×", note: "Every $1 becomes $4.20", pct: 100 },
  ];
  return (
    <section className="aurora-field px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <Eyebrow>02 — The city pulse</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
            A <span className="aurora-text">ledger</span> for the public good.
          </h2>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Tile key={m.label}>
              <Eyebrow>{m.label}</Eyebrow>
              <div className="mt-3 font-display text-4xl font-bold">{m.value}</div>
              <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-ember shadow-[0_0_12px_var(--ember-glow)]"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
              <div className="mt-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">{m.note}</div>
            </Tile>
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Live dispatch map · {DISPATCHES.length} tracked batches
          </h3>
          <DisplayControls surface="city map" />
        </div>

        <div
          className="bento relative overflow-hidden p-0"
          role="group"
          aria-label="Live city dispatch map. Use Tab to move between dispatch hotspots and Enter to open a ledger."
        >
          <img
            src={cityMap}
            alt="City heat map with glowing dots representing live meal distribution hubs"
            className="h-[420px] w-full object-cover"
            style={{ opacity: "var(--tf-img-opacity, 0.42)" }}
            width={1920}
            height={640}
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: "var(--tf-scrim, 0.62)" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" aria-hidden="true" />

          {DISPATCHES.map((d, i) => (
            <MapHotspot key={d.id} dispatch={d} index={i} />
          ))}

          <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Live city map · Galveston, TX
              </div>
              <div className="font-display text-2xl font-bold">42 active hubs · 1,482 meals today</div>
            </div>
            <Link
              to="/civic"
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              View civic dashboard →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkBento() {
  const partners = [
    "Local Restaurants", "Food Trucks", "Community Kitchens", "Meal Prep Co-ops",
    "Church Kitchens", "School Cafeterias", "Caterers", "Disaster Response",
  ];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-12">
        <Tile className="lg:col-span-5 p-8">
          <Eyebrow>03 — The network</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
            Every kitchen counts as <span className="aurora-text">infrastructure</span>.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            From a midnight food truck to a school cafeteria after hours — we treat
            every kitchen as critical civic infrastructure for the neighborhood it serves.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/kitchen"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Join as a kitchen
            </Link>
            <Link
              to="/volunteer"
              className="rounded-full border border-border-strong px-6 py-3 text-sm font-semibold transition-colors hover:border-ember hover:text-ember-text"
            >
              Volunteer
            </Link>
          </div>
        </Tile>

        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {partners.map((p, i) => (
            <Tile key={p} className="group flex items-center justify-between p-5">
              <div>
                <div className="font-mono text-[10px] text-ember-text">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-1.5 font-display text-lg font-semibold">{p}</div>
              </div>
              <span className="text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-ember-text">→</span>
            </Tile>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorshipBento() {
  const tiers = [
    {
      tag: "Neighborhood",
      price: "$2,000",
      cadence: "/ month",
      meals: "≈ 500 meals",
      blurb: "Anchor a ward with a guaranteed monthly meal floor and a branded impact report.",
      featured: false,
    },
    {
      tag: "City Partner",
      price: "$25,000",
      cadence: "/ month",
      meals: "≈ 8,000 meals",
      blurb: "Power a full metro response — disaster prep, outreach, senior support, school programs.",
      featured: true,
    },
    {
      tag: "School / Church",
      price: "Free",
      cadence: "to join",
      meals: "Receive funding",
      blurb: "Activate your kitchen after hours. Receive funded orders, training, and a dashboard.",
      featured: false,
    },
  ];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow>04 — Sponsorship & cities</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">
              Build a <span className="aurora-text">floor</span> for your community.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Businesses, cities, and institutions can sponsor neighborhoods, schools,
            or complete disaster response programs.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.tag}
              className={`bento flex flex-col p-8 ${
                t.featured ? "border-ember/60 shadow-[0_30px_90px_-40px_var(--ember-glow)] lg:-translate-y-2" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <Eyebrow>{t.tag}</Eyebrow>
                {t.featured && (
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                    Most impact
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.cadence}</span>
              </div>
              <div className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-ember-text">{t.meals}</div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{t.blurb}</p>
              <Link
                to="/impact"
                className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] ${
                  t.featured
                    ? "bg-primary text-primary-foreground"
                    : "border border-border-strong hover:border-ember hover:text-ember-text"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="bento aurora-field p-10 text-center md:p-16">
          <Eyebrow>Start now</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] md:text-5xl">
            Someone eats tonight because of what you do in the{" "}
            <span className="aurora-text">next sixty seconds</span>.
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/impact"
              className="rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_20px_60px_-20px_var(--ember-glow)] transition-transform hover:scale-[1.03]"
            >
              Fund meals now
            </Link>
            <Link
              to="/app"
              className="rounded-full border border-border-strong px-8 py-4 text-sm font-semibold transition-colors hover:border-ember hover:text-ember-text"
            >
              Open MealForge
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
        <div>
          <div className="font-display text-lg font-bold">
            Table<span className="aurora-text">Forward</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Public benefit infrastructure for a world without hunger.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="transition-colors hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <HeroBento />
      <HowBento />
      <StabilizationBento />
      <PulseBento />
      <NetworkBento />
      <SponsorshipBento />
      <CTA />
      <Footer />
    </div>
  );
}
