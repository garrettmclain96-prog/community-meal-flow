import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ChefHat, CookingPot, Home, ShoppingBasket, CalendarRange } from "lucide-react";

import { AccountButton } from "@/components/AccountButton";
import { MealForgeProvider } from "@/lib/food/store";


export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "MealForge — Household Food Intelligence | TableForward" },
      {
        name: "description",
        content:
          "Plan a week of dinners against your real budget, pantry and local package prices. MealForge is TableForward's household food intelligence app.",
      },
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
  { to: "/app/kitchen", label: "Kitchen", icon: ChefHat, exact: false },
] as const;

function MealForgeShell() {
  return (
    <MealForgeProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
            <Link to="/app" className="font-display text-xl font-bold italic tracking-tight">
              Meal<span className="text-ember">Forge</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-ember-text"
              >
                TableForward ↗
              </Link>
              <AccountButton />
            </div>

          </div>
        </header>

        <main className="mx-auto max-w-3xl px-5 pb-28 pt-6">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl">
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {TABS.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: "text-ember-text" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors hover:text-ember-text"
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
