import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

import "@/brand-refresh.css";
import "@/workflow-experience.css";
import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

const NAV = [
  { to: "/impact", label: "Impact" },
  { to: "/help", label: "Need food" },
  { to: "/kitchen", label: "Run a kitchen" },
  { to: "/volunteer", label: "Deliver" },
  { to: "/civic", label: "Proof" },
  { to: "/about", label: "Story" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pl-signal-bar">
        <div className="site-shell pl-signal-inner">
          <span className="pl-signal-live"><i aria-hidden="true" /> Galveston County · founding pilot</span>
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
              <span className="pl-brand-sub">close the loop</span>
            </span>
          </Link>

          <nav className="hidden items-center lg:flex" aria-label="Primary navigation">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="pl-nav-link" activeProps={{ className: "pl-nav-link is-active" }}>
                {item.label}
              </Link>
            ))}
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
            <Link to="/pilot" className="pl-header-action hidden md:inline-flex">
              Join the pilot <ArrowUpRight className="size-4" />
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
              <Link to="/app" className="pl-mobile-link" onClick={() => setOpen(false)}>
                MealForge <span>07 ↗</span>
              </Link>
              <Link to="/partners" className="pl-mobile-link" onClick={() => setOpen(false)}>
                Partners <span>08 ↗</span>
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
            NO OUTCOME.
            <br />
            <span>NO CREDIT.</span>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[#b8b2a7]">
            ProvisionLoop exists to close the last-mile gap between somebody needing food and the
            local people, kitchens and funding already willing to help. Need stays private. Outcomes
            get counted only when the loop actually closes.
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Act</p>
          <div className="mt-5 grid gap-3 text-sm">
            <Link className="pl-footer-link" to="/pilot">Join the founding pilot</Link>
            <Link className="pl-footer-link" to="/help">Request food help</Link>
            <Link className="pl-footer-link" to="/kitchen">Activate kitchen capacity</Link>
            <Link className="pl-footer-link" to="/volunteer">Claim local work</Link>
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Verify</p>
          <div className="mt-5 grid gap-3 text-sm">
            <Link className="pl-footer-link" to="/impact">Impact</Link>
            <Link className="pl-footer-link" to="/civic">Public proof</Link>
            <Link className="pl-footer-link" to="/trust-method">Trust &amp; method</Link>
            <Link className="pl-footer-link" to="/about">Why this exists</Link>
            <Link className="pl-footer-link" to="/partners">Partners</Link>
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
          <span>Founded by Garrett McLain · Good intentions need execution.</span>
        </div>
      </div>
    </footer>
  );
}
