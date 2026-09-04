import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/impact", label: "Fund meals" },
  { to: "/help", label: "Find food" },
  { to: "/kitchen", label: "For kitchens" },
  { to: "/volunteer", label: "Volunteer" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="site-shell flex h-[72px] items-center justify-between gap-4">
        <Link to="/" className="brand-mark" onClick={() => setOpen(false)}>
          <span className="brand-dot" aria-hidden="true" />
          <span>PROVISION</span>
          <span className="text-primary">LOOP</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="nav-link">
              {item.label}
            </Link>
          ))}
          <Link to="/app" className="nav-link">
            MealForge
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <AccountButton />
          </div>
          <Link to="/impact" className="button-primary hidden md:inline-flex">
            Fund a meal
          </Link>
          <button
            type="button"
            className="icon-button lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav lg:hidden" aria-label="Mobile navigation">
          <div className="site-shell grid gap-2 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="mobile-nav-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link to="/app" className="mobile-nav-link" onClick={() => setOpen(false)}>
              MealForge <span aria-hidden="true">↗</span>
            </Link>
            <div className="mt-2 border-t border-border pt-4 sm:hidden">
              <AccountButton />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-foreground bg-foreground text-background">
      <div className="site-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="brand-mark text-background">
            <span className="brand-dot" aria-hidden="true" /> PROVISION
            <span className="text-primary">LOOP</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-background/70">
Accountable local food infrastructure: private requests, verified partners, paid local
            kitchen capacity and a public aggregate ledger—starting in Galveston County.
          </p>
        </div>
        <div>
          <p className="kicker text-primary">Take action</p>
          <div className="mt-4 grid gap-2 text-sm">
            <Link to="/impact">Fund meals</Link>
            <Link to="/help">Find food help</Link>
            <Link to="/volunteer">Volunteer nearby</Link>
          </div>
        </div>
        <div>
          <p className="kicker text-primary">Build with us</p>
          <div className="mt-4 grid gap-2 text-sm">
            <Link to="/kitchen">Kitchen network</Link>
            <Link to="/partners">Community partners</Link>
            <Link to="/civic">Public ledger</Link>
            <Link to="/trust-method">Trust &amp; method</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-background/20">
        <div className="site-shell flex flex-wrap justify-between gap-3 py-5 text-xs text-background/55">
          <span>© 2026 ProvisionLoop</span>
          <span>Recipient identities never appear on the public ledger.</span>
        </div>
      </div>
    </footer>
  );
}
