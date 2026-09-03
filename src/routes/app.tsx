import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BookOpen, CookingPot, Home, ShoppingBasket, CalendarRange } from "lucide-react";

import { AccountButton } from "@/components/AccountButton";
import { MealForgeProvider } from "@/lib/food/store";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "MealForge — Household Food Intelligence | ProvisionLoop" },
      {
        name: "description",
        content:
          "Plan a week of dinners against your real budget, pantry and local package prices. MealForge is ProvisionLoop's household food intelligence app.",
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
  { to: "/app/kitchen", label: "Library", icon: BookOpen, exact: false },
] as const;

function MealForgeShell() {
  return (
    <MealForgeProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
            <Link to="/app" className="font-display text-xl font-black tracking-[-0.05em]">
              MEAL<span className="text-primary">FORGE</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-ember-text"
              >
                ProvisionLoop ↗
              </Link>
              <AccountButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-5 pb-28 pt-6">
          <Outlet />
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-foreground bg-background/95 backdrop-blur-xl"
          aria-label="MealForge"
        >
          <div className="mx-auto grid max-w-3xl grid-cols-5">
            {TABS.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                activeProps={{ className: "text-ember-text" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex min-h-[66px] flex-col items-center justify-center gap-1 py-2 text-xs font-bold transition-colors hover:text-ember-text"
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
