import { createFileRoute, Link } from "@tanstack/react-router";

import { useMealForge } from "@/lib/food/store";
import { STORE_BY_ID } from "@/lib/food/pricing";
import { householdServings } from "@/lib/food/planner";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Your Week — MealForge" },
      {
        name: "description",
        content: "Your household budget, pantry depth and this week's dinner plan at a glance.",
      },
      { property: "og:title", content: "Your Week — MealForge" },
      {
        property: "og:description",
        content: "Household budget, pantry depth and this week's dinner plan at a glance.",
      },
    ],
  }),
  component: MealForgeHome,
});

function MealForgeHome() {
  const { state, ready } = useMealForge();
  const { household, pantry, plan, recipes } = state;

  if (!ready) return <p className="text-sm text-muted-foreground">Loading your household…</p>;

  if (!state.onboarded) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Let's set your table.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tell MealForge who eats, what they avoid, where you shop and what you can spend. Every
          plan after that is built against those constraints — not guessed.
        </p>
        <Link
          to="/app/setup"
          className="mt-6 inline-flex rounded-sm bg-ember px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Set up my household
        </Link>
      </section>
    );
  }

  const store = STORE_BY_ID[household.storeIds[0] ?? "heb"];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">{household.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {household.members.length} people · {householdServings(household)} servings per dinner ·{" "}
          {household.dinnersPerWeek} dinners a week · {store?.name ?? "no store"}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Weekly budget" value={`$${household.weeklyBudget.toFixed(2)}`} />
        <Stat
          label="Plan cost"
          value={plan ? `$${plan.totalCost.toFixed(2)}` : "—"}
          tone={plan && plan.gap > 0 ? "warn" : "ok"}
        />
        <Stat label="Pantry items" value={String(pantry.length)} />
      </div>

      {plan && plan.gap > 0 && (
        <div className="rounded-lg border border-ember/40 bg-ember/5 p-4 text-sm">
          <p className="font-semibold text-ember-text">
            ${plan.gap.toFixed(2)} over budget this week
          </p>
          <p className="mt-1 text-muted-foreground">
            A gap this size is exactly what TableForward's assistance bridge is designed to close —
            grocery subsidy pools and sponsored baskets, without ever exposing who you are.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Tile
          to="/app/plan"
          title={plan ? "Review this week's plan" : "Build this week's plan"}
          body={
            plan
              ? `${plan.meals.length} dinners scored against your pantry and budget.`
              : "Deterministic selection across your constraints, pantry and local prices."
          }
        />
        <Tile
          to="/app/shop"
          title="Grocery list"
          body="One consolidated list, rounded to real package sizes, grouped by aisle."
        />
        <Tile
          to="/app/kitchen"
          title="Pantry & recipes"
          body={`${pantry.length} pantry items · ${recipes.length} recipes in your library.`}
        />
        <Tile
          to="/app/setup"
          title="Household settings"
          body="Members, allergies, stores, budget."
        />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          tone === "warn" ? "text-ember-text" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Tile({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-ember/50"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
