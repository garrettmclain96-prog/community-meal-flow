import { createFileRoute } from "@tanstack/react-router";
import heroTable from "@/assets/hero-table.jpg";
import cityMap from "@/assets/city-map.jpg";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { DisplayControls } from "@/components/DisplayControls";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapHotspot } from "@/components/MapHotspot";
import { DISPATCHES } from "@/data/dispatches";
import { useDisplaySettings } from "@/lib/display-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TableForward 2.0 — Civic Infrastructure for Food Security" },
      {
        name: "description",
        content:
          "A real-time, transparent community funding engine. Stabilize local kitchens. Feed neighborhoods. Verifiable, neighborhood-scaled, civic-grade.",
      },
      { property: "og:title", content: "TableForward 2.0 — Civic Infrastructure for Food Security" },
      {
        property: "og:description",
        content:
          "Live community-powered food security. Fund a meal. Stabilize a restaurant. Feed a neighborhood.",
      },
      { property: "og:image", content: heroTable },
      { property: "og:type", content: "website" },
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

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <span className="font-display text-2xl font-bold tracking-tight italic">
            Table<span className="text-ember">Forward</span>
          </span>
          <div className="hidden md:flex gap-7 text-sm font-medium text-muted-foreground">
            <a href="#engine" className="hover:text-ember-text transition-colors">The Engine</a>
            <a href="#pulse" className="hover:text-ember-text transition-colors">City Pulse</a>
            <a href="#network" className="hover:text-ember-text transition-colors">Network</a>
            <a href="#transparency" className="hover:text-ember-text transition-colors">Transparency</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DisplayControls surface="site photography" className="hidden lg:inline-flex" />
          <ThemeToggle />
          <button className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold border border-border rounded-sm hover:bg-surface transition-all">
            Partner Login
          </button>
          <button className="px-5 py-2 text-sm font-semibold bg-ember text-primary-foreground rounded-sm shadow-[0_10px_40px_-10px_var(--ember-glow)] hover:shadow-[0_15px_60px_-10px_var(--ember-glow)] hover:scale-[1.02] transition-all">
            Fund a Meal
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Background hero image with overlay */}
      <PhotoBackdrop
        className="-z-10"
        src={heroTable}
        alt="A communal table at dusk lit by candles and string lights, families sharing a meal together"
        imgClassName="animate-flicker"
        width={1280}
        height={960}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" aria-hidden="true" />
      </PhotoBackdrop>

      <div className="relative px-6 pt-28 pb-40 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 flex flex-col justify-center animate-slide-up">
          <div className="inline-flex items-center gap-3 mb-8">
            <LiveDot />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember-text font-semibold">
              Live Network Status — Operational in 128 Cities
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl tracking-tight text-balance leading-[0.92] mb-8">
            Infrastructure for{" "}
            <span className="italic text-ember">human</span> security.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[48ch] mb-10 leading-relaxed text-pretty">
            TableForward is a civic-grade funding engine. We stabilize local kitchens
            while delivering guaranteed nutrition to families in need —
            verifiable, real-time, neighborhood-scaled.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="group px-8 py-4 bg-ember text-primary-foreground font-semibold text-base hover:bg-ember-glow transition-all shadow-[0_20px_60px_-20px_var(--ember-glow)]">
              Fund a Neighborhood
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="px-8 py-4 border border-border bg-surface/40 backdrop-blur-sm font-semibold text-base hover:border-ember hover:text-ember-text transition-all">
              Corporate Sponsorships
            </button>
          </div>

          <div className="mt-14 flex items-center gap-8 text-xs font-mono text-muted-foreground">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Verified by</div>
              <div className="text-foreground">Stripe Impact Ledger</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Partnered with</div>
              <div className="text-foreground">82 Local Nonprofits</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4 animate-slide-up [animation-delay:200ms]">
          <div className="grain p-8 bg-surface-elevated/80 backdrop-blur-md text-foreground rounded-sm border border-border shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Aggregate Global Impact
              </div>
              <LiveDot />
            </div>
            <div className="text-6xl md:text-7xl font-display italic mb-2 tracking-tight text-ember">
              482,901
            </div>
            <div className="text-sm text-muted-foreground mb-8">
              Meals delivered since January 2024
            </div>

            <div className="space-y-0">
              {[
                ["CITIES ACTIVE", "128"],
                ["REST. REVENUE FLOOR", "$12.4M"],
                ["FAMILIES SERVED / WK", "8,201"],
                ["AVG DELIVERY TIME", "14.2m"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between text-xs font-mono border-t border-border py-3"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-surface/60 border border-border rounded-sm font-mono text-[11px] space-y-2 backdrop-blur">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[10px] uppercase tracking-widest">Live Ledger</span>
              <span className="text-[10px] text-muted-foreground">streaming</span>
            </div>
            {[
              ["14:21", "Batch #982 → North Oak Family Center"],
              ["14:18", "TechCorp funded 500 meals · Ward 4"],
              ["14:15", "St. Jude kitchens synced · Ward 4"],
              ["14:11", "12 meals delivered · Riverside Seniors"],
            ].map(([t, msg]) => (
              <div key={t} className="flex gap-3 text-muted-foreground">
                <span className="text-ember-text">{t}</span>
                <span className="truncate">{msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Anyone funds a meal.",
      body: "Citizens, businesses, and cities contribute. Every dollar is tied to a single, trackable meal — not a black-box donation pool.",
    },
    {
      n: "02",
      title: "Smart matching routes it.",
      body: "Our engine matches funding to verified local kitchens — food trucks, caterers, church kitchens, school cafeterias — based on neighborhood demand.",
    },
    {
      n: "03",
      title: "Nonprofits deliver it.",
      body: "Verified nonprofit partners route meals to families, seniors, school kids, veterans, and disaster zones. Receipts go on-ledger.",
    },
  ];
  return (
    <section className="border-y border-border bg-surface/40 py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-20">
          <span className="font-mono text-[10px] text-ember-text font-bold uppercase tracking-[0.2em] mb-4 block">
            00 // How the Engine Works
          </span>
          <h2 className="text-4xl md:text-5xl font-display leading-[1.05]">
            A live, transparent,{" "}
            <span className="italic text-ember">community-powered</span> food
            security engine.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {steps.map((s) => (
            <div key={s.n} className="bg-background p-10 group hover:bg-surface transition-colors">
              <div className="font-mono text-xs text-ember-text mb-6">{s.n}</div>
              <h3 className="font-display text-2xl mb-4 italic">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StabilizationEngine() {
  return (
    <section id="engine" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-xl">
            <span className="font-mono text-[10px] text-ember-text font-bold uppercase tracking-[0.2em] mb-4 block">
              01 // The Stabilization Engine
            </span>
            <h2 className="text-4xl md:text-5xl font-display leading-tight mb-5">
              We eliminate the volatility of being a{" "}
              <span className="italic">local restaurant.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our matching algorithm predicts neighborhood demand and guarantees a
              revenue floor for small kitchens — so they stay open through every
              slow season.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-5 py-3 bg-surface border border-border rounded-sm text-center">
              <div className="text-2xl font-display text-ember">1,402</div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
                Active Kitchens
              </div>
            </div>
            <div className="px-5 py-3 bg-surface border border-border rounded-sm text-center">
              <div className="text-2xl font-display text-ember">98.4%</div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
                Retention
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-elevated border border-border p-8 rounded-sm font-mono text-xs overflow-hidden grain">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
              <span className="text-foreground tracking-wider">
                KITCHEN_PARTNER_042 // REVENUE_DASHBOARD
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-2">
                <LiveDot /> REFRESH 12.0s
              </span>
            </div>

            <div className="relative flex items-end gap-3 h-56 mb-2">
              {[
                [55, 38], [70, 42], [60, 30], [78, 50],
                [55, 48], [82, 60], [65, 45], [90, 70], [72, 55],
              ].map(([organic, floor], i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-1 relative">
                  <div
                    className="bg-ember/30 rounded-t-[2px] transition-all"
                    style={{ height: `${organic}%` }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-ember shadow-[0_-2px_20px_var(--ember-glow)]"
                    style={{ height: `${floor}%` }}
                  />
                </div>
              ))}
              <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-foreground/60 pointer-events-none">
                <span className="absolute -top-4 right-0 text-[9px] text-foreground bg-surface-elevated px-1">
                  GUARANTEED_FLOOR
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6 mt-6">
              <div>
                <div className="text-muted-foreground mb-1 uppercase">Predicted Vol.</div>
                <div className="text-base text-foreground font-medium">1,240 meals</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 uppercase">Direct Funding</div>
                <div className="text-base text-foreground font-medium">$18,490.00</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 uppercase">Labor Subsidy</div>
                <div className="text-base text-ember-text font-medium">+ $2,400.00</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              ["Guaranteed daily revenue", "Daily purchase agreements that cover overhead before the first walk-in."],
              ["Micro-grants & supplies", "Discounted ingredients, equipment grants, kitchen upgrades."],
              ["Volunteer labor pool", "On-demand prep help routed by the network during peak hours."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="p-5 bg-surface border border-border rounded-sm hover:border-ember/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="size-1.5 rounded-full bg-ember mt-2 shrink-0 shadow-[0_0_12px_var(--ember-glow)]" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] bg-foreground text-background hover:bg-ember hover:text-primary-foreground transition-colors">
              Apply as a Kitchen Partner
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CityPulse() {
  const { imageOpacity, scrim } = useDisplaySettings();
  const metrics = [
    { label: "Neighborhoods Impacted", value: "42", note: "Coverage: 85% of city", pct: 85 },
    { label: "Families Supported", value: "8,201", note: "Active households this week", pct: 62 },
    { label: "Meals Today", value: "1,482", note: "Target: 1,600 / day", pct: 92 },
    { label: "Corporate Match", value: "4.2×", note: "Every $1 becomes $4.20", pct: 100 },
  ];
  return (
    <section id="pulse" className="py-28 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="font-mono text-[10px] text-ember-text font-bold uppercase tracking-[0.2em] mb-4 inline-block">
            02 // The City Pulse
          </span>
          <h2 className="text-5xl md:text-6xl font-display tracking-tight mb-5 leading-[1.05]">
            A <span className="italic text-ember">ledger</span> for the public good.
          </h2>
          <p className="text-muted-foreground text-lg">
            Absolute transparency on every dollar, every meal, every neighborhood —
            published in real time for every city we serve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-12">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-background p-7 hover:bg-surface transition-colors group"
            >
              <div className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-widest">
                {m.label}
              </div>
              <div className="text-5xl font-display mb-5 text-foreground group-hover:text-ember-text transition-colors">
                {m.value}
              </div>
              <div className="h-[2px] bg-surface w-full overflow-hidden">
                <div
                  className="h-full bg-ember shadow-[0_0_12px_var(--ember-glow)]"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
              <div className="text-[10px] mt-3 text-muted-foreground uppercase tracking-wider">
                {m.note}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Live dispatch map · {DISPATCHES.length} tracked batches
          </h3>
          <DisplayControls surface="city map" />
        </div>

        <div
          className="relative bg-surface-elevated border border-border rounded-sm overflow-hidden"
          role="group"
          aria-label="Live city dispatch map. Use Tab to move between dispatch hotspots and Enter to open a ledger."
        >
          <img
            src={cityMap}
            alt="Dark city heat map with glowing amber dots representing live meal distribution hubs"
            className="w-full h-[420px] object-cover"
            style={{ opacity: imageOpacity / 100 }}
            width={1920}
            height={640}
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: scrim / 100 }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" aria-hidden="true" />

          {DISPATCHES.map((d, i) => (
            <MapHotspot key={d.id} dispatch={d} index={i} />
          ))}

          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap justify-between items-end gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Live City Map · Portland, OR
              </div>
              <div className="font-display text-2xl italic">42 active hubs · 1,482 meals today</div>
            </div>
            <button className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-ember text-primary-foreground hover:bg-ember-glow transition-colors">
              View Full Dashboard →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Network() {
  const partners = [
    "Local Restaurants", "Food Trucks", "Community Kitchens",
    "Meal Prep Co-ops", "Church Kitchens", "School Cafeterias",
    "Caterers", "Disaster Response",
  ];
  return (
    <section id="network" className="bg-surface/40 border-t border-border py-28 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5">
          <span className="font-mono text-[10px] text-ember-text font-bold uppercase tracking-[0.2em] mb-4 block">
            03 // The Network
          </span>
          <h2 className="text-4xl md:text-5xl font-display leading-tight mb-6">
            Every kitchen counts as <span className="italic text-ember">infrastructure.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We don't just route meals to restaurants. We treat every kitchen — from
            a midnight food truck to a school cafeteria after hours — as critical
            civic infrastructure for the neighborhood it serves.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-ember text-primary-foreground font-semibold text-sm hover:bg-ember-glow transition-colors">
              Join as a Kitchen
            </button>
            <button className="px-6 py-3 border border-border font-semibold text-sm hover:border-ember hover:text-ember-text transition-colors">
              Volunteer
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 gap-px bg-border">
          {partners.map((p, i) => (
            <div
              key={p}
              className="bg-background p-6 flex items-center justify-between group hover:bg-surface transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] text-ember-text mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display text-xl">{p}</div>
              </div>
              <span className="text-muted-foreground group-hover:text-ember-text group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sponsorship() {
  const tiers = [
    {
      tag: "Neighborhood",
      price: "$2,000",
      cadence: "/ month",
      meals: "≈ 500 meals",
      blurb: "Anchor a ward with a guaranteed monthly meal floor — branded community impact report included.",
      cta: "Adopt a Neighborhood",
    },
    {
      tag: "City Partner",
      price: "$25,000",
      cadence: "/ month",
      meals: "≈ 8,000 meals",
      blurb: "Power an entire metro response — disaster preparedness, homeless outreach, senior support, school programs.",
      cta: "Become a City Partner",
      featured: true,
    },
    {
      tag: "School / Church",
      price: "Free",
      cadence: "to join",
      meals: "Receive funding",
      blurb: "Activate your kitchen after-hours. Receive funded orders, training, and a community impact dashboard.",
      cta: "Join the Network",
    },
  ];
  return (
    <section id="transparency" className="py-28 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <span className="font-mono text-[10px] text-ember-text font-bold uppercase tracking-[0.2em] mb-4 block">
              04 // Sponsorship & Cities
            </span>
            <h2 className="text-4xl md:text-5xl font-display leading-tight">
              Build a <span className="italic text-ember">floor</span> for your community.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Businesses, cities, and institutions can sponsor neighborhoods,
            schools, or full disaster response programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.tag}
              className={`relative p-8 rounded-sm border transition-all ${
                t.featured
                  ? "bg-ember text-primary-foreground border-ember shadow-[0_30px_80px_-30px_var(--ember-glow)] scale-[1.02]"
                  : "bg-surface border-border hover:border-ember/40"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-8 px-3 py-1 bg-background text-ember-text text-[10px] font-mono uppercase tracking-widest border border-border">
                  Most Impact
                </div>
              )}
              <div
                className={`font-mono text-[10px] uppercase tracking-widest mb-4 ${
                  t.featured ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t.tag}
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display italic">{t.price}</span>
                <span className={t.featured ? "text-primary-foreground text-sm" : "text-muted-foreground text-sm"}>
                  {t.cadence}
                </span>
              </div>
              <div
                className={`text-sm mb-6 ${
                  t.featured ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t.meals}
              </div>
              <p className="text-sm leading-relaxed mb-8">{t.blurb}</p>
              <button
                className={`w-full py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  t.featured
                    ? "bg-background text-foreground hover:bg-surface-elevated"
                    : "bg-foreground text-background hover:bg-ember hover:text-primary-foreground"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative py-32 px-6 border-t border-border overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <PhotoBackdrop
          src={heroTable}
          alt=""
          intensity={0.5}
          loading="lazy"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" aria-hidden="true" />
        </PhotoBackdrop>
      </div>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-display leading-[1.05] mb-8 text-balance">
          A seat at every table.{" "}
          <span className="italic text-ember">Starting tonight.</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
          Join 4,000+ funders, 1,402 kitchens, and 82 nonprofits already moving
          meals across 128 cities — in real time.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-10 py-4 bg-ember text-primary-foreground font-semibold hover:bg-ember-glow transition-colors shadow-[0_30px_80px_-20px_var(--ember-glow)]">
            Fund Your First Meal — $4
          </button>
          <button className="px-10 py-4 border border-border bg-surface/40 backdrop-blur-sm font-semibold hover:border-ember hover:text-ember-text transition-all">
            Talk to the Cities Team
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface-elevated/50 border-t border-border py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
        <div className="max-w-md">
          <div className="font-display text-3xl italic mb-5">
            Table<span className="text-ember">Forward</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            A public benefit corporation building the digital and logistical rails
            for a world without hunger. No fluff. No soft-focus. Just meals,
            tracking, and local economic resilience.
          </p>
          <div className="flex gap-3">
            {["B", "L", "T", "I"].map((l) => (
              <a
                key={l}
                href="#"
                className="size-10 bg-surface border border-border rounded-sm flex items-center justify-center text-xs font-mono hover:bg-ember hover:text-primary-foreground hover:border-ember transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
          {[
            { h: "Civic Tools", items: ["City Dashboard", "Kitchen Stabilization", "Impact Audits", "Sponsor a Ward"] },
            { h: "Movement", items: ["Volunteer Logistics", "Church Partnerships", "School Kitchens", "Join Core Team"] },
            { h: "Ledger", items: ["Transparency Policy", "API & Receipts", "Press", "Privacy"] },
          ].map((col) => (
            <div key={col.h}>
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-5">
                {col.h}
              </h5>
              <ul className="space-y-3 text-sm">
                {col.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-ember-text transition-colors">{i}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <div>© 2026 TableForward PBC · Data verified by Stripe Impact</div>
        <div className="flex items-center gap-2">
          <LiveDot /> Network operational · 128 cities
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <Hero />
      <HowItWorks />
      <StabilizationEngine />
      <CityPulse />
      <Network />
      <Sponsorship />
      <FinalCTA />
      <Footer />
    </div>
  );
}
