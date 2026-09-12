import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BookOpen, CalendarRange, CookingPot, Home, ShoppingBasket } from "lucide-react";

import "@/mealforge-experience.css";
import { AccountButton } from "@/components/AccountButton";
import { MealForgeProvider, useMealForge } from "@/lib/food/store";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "MealForge — Household Food Intelligence | ProvisionLoop" },
      {
        name: "description",
        content:
          "Plan a week of dinners against your real budget, pantry and local package prices. MealForge is ProvisionLoop's household food intelligence app.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "MealForge — Household Food Intelligence" },
      {
        property: "og:description",
        content:
          "Deterministic weekly meal planning built on your household budget, pantry and local grocery prices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MealForgeShell,
});

const TABS = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/plan", label: "Plan", icon: CalendarRange, exact: false },
  { to: "/app/shop", label: "Shop", icon: ShoppingBasket, exact: false },
  { to: "/app/cook", label: "Cook", icon: CookingPot, exact: false },
  { to: "/app/kitchen", label: "Library", icon: BookOpen, exact: false },
] as const;

function MealForgeShell() {
  return (
    <MealForgeProvider>
      <div className="mf-shell min-h-dvh text-foreground">
        <header className="mf-header">
          <div className="mx-auto flex min-h-[70px] max-w-3xl items-center justify-between gap-4 px-5 py-3">
            <Link to="/app" className="mf-brand" aria-label="MealForge home">
              <span className="mf-brand-mark">MF</span>
              <span>
                MEAL<span className="text-primary">FORGE</span>
                <small>household food intelligence</small>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/" className="mf-context-link">
                ProvisionLoop ↗
              </Link>
              <AccountButton redirectTo="/app" />
            </div>
          </div>
        </header>

        <main className="mf-content mx-auto max-w-3xl px-5 pb-28 pt-7">
          <SaveStatus />
          <Outlet />
        </main>

        <nav className="mf-bottom-nav" aria-label="MealForge">
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {TABS.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: "mf-tab is-active" }}
                inactiveProps={{ className: "mf-tab" }}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </MealForgeProvider>
  );
}

function SaveStatus() {
  const { ready, saveStatus } = useMealForge();
  return (
    <p role="status" className="mb-5 font-mono text-xs text-muted-foreground">
      {ready ? saveStatus : "Opening your household…"}
    </p>
  );
}
