import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Clock3,
  PackageCheck,
  ShieldCheck,
  ShoppingBasket,
} from "lucide-react";

import "@/home-refresh.css";
import "@/mealforge-public.css";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import dinnerImage from "@/assets/hero-table.jpg";

export const Route = createFileRoute("/mealforge")({
  head: () => ({
    meta: [
      { title: "MealForge — Plan Dinner Against Your Real Budget" },
      {
        name: "description",
        content:
          "MealForge builds weekly dinner plans around your household, allergies, pantry, budget, equipment and time, then creates one package-aware grocery list.",
      },
      { property: "og:title", content: "MealForge — Household Food Intelligence" },
      {
        property: "og:description",
        content:
          "Plan first. Shop once. Waste less. Build dinner around the food, money and time you actually have.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MealForgePublicPage,
});

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: "Your food rules are hard limits",
    body: "Custom allergies, intolerances and foods to avoid are checked before a recipe enters the plan.",
  },
  {
    icon: PackageCheck,
    title: "Your pantry counts first",
    body: "MealForge offsets what you already own before calculating what the week needs.",
  },
  {
    icon: ShoppingBasket,
    title: "One package-aware list",
    body: "Ingredients consolidate into realistic store packages instead of a pile of disconnected recipe lists.",
  },
  {
    icon: Clock3,
    title: "Built around real life",
    body: "Budget, cook time, household size and available equipment shape every week.",
  },
] as const;

function MealForgePublicPage() {
  return (
    <div className="mf-public">
      <SiteHeader />
      <main>
        <section className="mf-public-hero">
          <div className="site-shell mf-public-hero-grid">
            <div>
              <p className="mf-public-kicker">
                <ChefHat className="size-4" /> Household food intelligence
              </p>
              <h1>
                REAL LIFE.
                <br />
                <em>REAL DINNER.</em>
              </h1>
              <p className="mf-public-deck">
                MealForge turns your household, pantry, allergies, budget and time into a week you
                can actually cook and afford.
              </p>
              <p className="mf-public-line">PLAN FIRST. SHOP ONCE. WASTE LESS.</p>
              <div className="mf-public-actions">
                <Link to="/app/setup" className="mf-public-primary">
                  Build my first week <ArrowRight className="size-5" />
                </Link>
                <a href="#how-it-works" className="mf-public-secondary">
                  See how it works
                </a>
              </div>
              <small>
                Works locally without an account. Sign in when you want your household saved across
                devices.
              </small>
            </div>
            <figure className="mf-public-photo">
              <img
                src={dinnerImage}
                alt="An evening meal around a shared table"
                fetchPriority="high"
              />
              <figcaption>
                <span>THE HOUSEHOLD SIDE OF PROVISIONLOOP</span>
                <strong>
                  LESS GUESSWORK.
                  <br />
                  MORE AT THE TABLE.
                </strong>
              </figcaption>
              <div className="mf-public-ticket">
                <span>YOUR WEEK STARTS HERE</span>
                <strong>
                  YOUR PEOPLE.
                  <br />
                  YOUR PANTRY.
                  <br />
                  YOUR BUDGET.
                </strong>
                <small>Grocery costs are estimates. Confirm prices when you shop.</small>
              </div>
            </figure>
          </div>
        </section>

        <section className="mf-public-section" id="how-it-works">
          <div className="site-shell">
            <p className="mf-public-kicker">What makes it different</p>
            <h2>NOT ANOTHER RANDOM RECIPE FEED.</h2>
            <div className="mf-public-capabilities">
              {CAPABILITIES.map(({ icon: Icon, title, body }, index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <Icon className="size-7" />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mf-public-loop">
          <div className="site-shell mf-public-loop-grid">
            <div>
              <p className="mf-public-kicker">
                <BookOpen className="size-4" /> Inside ProvisionLoop
              </p>
              <h2>THE HOUSEHOLD SIDE OF THE LOOP.</h2>
            </div>
            <div>
              <p>
                MealForge helps households stretch what they have before a gap becomes an emergency.
                When a real budget still cannot cover the week, ProvisionLoop is designed to connect
                that private need to accountable local support.
              </p>
              <Link to="/app/setup">
                Start with my household <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
