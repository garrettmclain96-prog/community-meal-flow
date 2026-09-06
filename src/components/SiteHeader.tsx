import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

import "@/brand-refresh.css";
import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

const NAV = [
  { to: "/impact", label: "Fund" },
  { to: "/help", label: "Get help" },
  { to: "/kitchen", label: "Kitchens" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/partners", label: "Partners" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pl-signal-bar">
        <div className="site-shell pl-signal-inner">
          <span className="pl-signal-live"><i aria-hidden="true" /> Galveston County · pilot network</span>
          <span className="hidden sm:inline">Private need · local capacity · public accountability</span>
        </div>
      </div>
      <header className="pl-site-header">
        <div className="site-shell pl-header-row flex items-center justify-between gap-4">
          <Link to="/" className="pl-brand" onClick={() => setOpen(false)} aria-label="ProvisionLoop home">
            <span className="pl-brand-symbol">PL</span>
            <span className="min-w-0">
              <span className="pl-brand-wordmark">
                PROVISION<strong>LOOP</strong>
              </span>
              <span className="pl-brand-sub">community food infrastructure</span>
            </span>
          </Link>

          <nav className="hidden items-center lg:flex" aria-label="Primary navigation">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="pl-nav-link" activeProps={{ className: "pl-nav-link is-active" }}>
                {item.label}
              </Link>
            ))}
            <Link to="/civic" className="pl-nav-link" activeProps={{ className: "pl-nav-link is-active" }}>
              Ledger
            </Link>
            <Link to="/app" className="pl-nav-link" activeProps={{ className: "pl-nav-link is-active" }}>
              MealForge
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <AccountButton />
            </div>
            <div className="pl-header-icon hidden sm:block">
              <ThemeToggle />
            </div>
            <Link to="/impact" className="pl-header-action hidden md:inline-flex">
              Fund a meal <ArrowUpRight className="size-4" />
            </Link>
            <button
              type="button"
              className="icon-button pl-header-icon lg:hidden"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="pl-mobile-nav lg:hidden" aria-label="Mobile navigation">
            <div className="site-shell py-2">
              {NAV.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="pl-mobile-link"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  <span>{String(index + 1).padStart(2, "0")} ↗</span>
                </Link>
              ))}
              <Link to="/civic" className="pl-mobile-link" onClick={() => setOpen(false)}>
                Public ledger <span>07 ↗</span>
              </Link>
              <Link to="/app" className="pl-mobile-link" onClick={() => setOpen(false)}>
                MealForge <span>08 ↗</span>
              </Link>
              <div className="flex flex-wrap items-center gap-3 py-4 xl:hidden">
                <AccountButton />
                <ThemeToggle />
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="pl-footer">
      <div className="site-shell pl-footer-grid">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            ProvisionLoop · Galveston County
          </p>
          <div className="pl-footer-wordmark mt-4">
            FOOD THAT
            <br />
            <span>FINISHES THE LOOP.</span>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[#b8b2a7]">
            Funding enters through verified local kitchens, moves through accountable fulfillment,
            and closes with aggregate public proof. Recipient identities stay private.
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Act</p>
          <div className="mt-5 grid gap-3 text-sm">
            <Link className="pl-footer-link" to="/impact">Fund meals</Link>
            <Link className="pl-footer-link" to="/help">Find food help</Link>
            <Link className="pl-footer-link" to="/volunteer">Volunteer nearby</Link>
            <Link className="pl-footer-link" to="/pilot">Join the pilot</Link>
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Explore</p>
          <div className="mt-5 grid gap-3 text-sm">
            <Link className="pl-footer-link" to="/about">About + founder</Link>
            <Link className="pl-footer-link" to="/kitchen">Kitchen network</Link>
            <Link className="pl-footer-link" to="/partners">Community partners</Link>
            <Link className="pl-footer-link" to="/civic">Public ledger</Link>
            <Link className="pl-footer-link" to="/trust-method">Trust &amp; method</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-shell flex flex-wrap gap-x-5 gap-y-2 py-4 text-xs text-[#8e897f]">
          <a className="pl-footer-link" href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>
          <Link className="pl-footer-link" to="/legal">Legal Center</Link>
          <Link className="pl-footer-link" to="/legal/terms">Terms</Link>
          <Link className="pl-footer-link" to="/legal/privacy">Privacy</Link>
          <Link className="pl-footer-link" to="/legal/refunds">Refunds</Link>
          <Link className="pl-footer-link" to="/legal/fees-tax">Fees &amp; tax</Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="site-shell flex flex-wrap justify-between gap-3 py-5 text-xs text-[#6f6a61]">
          <span>© 2026 ProvisionLoop</span>
          <span>Founded by Garrett McLain · Built to close the loop.</span>
        </div>
      </div>
    </footer>
  );
}
