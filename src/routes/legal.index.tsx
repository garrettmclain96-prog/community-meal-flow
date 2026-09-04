import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import {
  LEGAL_DOCUMENTS,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  LEGAL_ORDER,
} from "@/lib/legal/registry";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title: "Legal Center — ProvisionLoop" },
      {
        name: "description",
        content:
          "Versioned platform terms for the ProvisionLoop Texas pilot: terms of service, privacy policy, refunds, fees and tax treatment, kitchen, partner and volunteer agreements.",
      },
      { property: "og:title", content: "Legal Center — ProvisionLoop" },
      {
        property: "og:description",
        content:
          "Every ProvisionLoop platform agreement in one place, with versions, effective dates and plain-language summaries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegalCenterPage,
});

function LegalCenterPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="print:hidden">
        <SiteHeader />
      </div>

      <main className="site-shell legal-doc py-12 md:py-16">
        <p className="kicker text-primary">Legal Center · Version 1.0</p>
        <h1 className="display-title mt-3 text-4xl md:text-6xl">
          The rules of the loop, written plainly.
        </h1>
        <p className="mt-4 max-w-[62ch] text-base text-muted-foreground">
          Every agreement below is versioned. Version 1.0 is effective {LEGAL_EFFECTIVE_DATE} and
          was last updated {LEGAL_LAST_UPDATED}. These are platform terms for the Texas pilot — they
          are not legal or tax advice to you.
        </p>

        <div className="editorial-card mt-8 p-5">
          <p className="kicker text-primary">Pilot status</p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <strong>Live payments are disabled.</strong> All checkout currently runs in the
              payment processor&apos;s test environment. No real money moves through the platform
              yet.
            </li>
            <li>
              <strong>Launch gate.</strong> The operating legal entity and a monitored legal contact
              channel must be published in this Legal Center before any live-money launch. Neither
              is published yet, and we will not invent one.
            </li>
            <li>
              <strong>Requests are reviewed by a person.</strong> Privacy and refund requests are
              queued for manual review. There is no automated fulfillment queue yet.
            </li>
          </ul>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {LEGAL_ORDER.map((key) => {
            const doc = LEGAL_DOCUMENTS[key];
            return (
              <Link key={key} to={doc.path} className="bento block p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl font-black tracking-tight">{doc.title}</h2>
                  <span className="font-mono text-xs text-muted-foreground">v{doc.version}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{doc.summary}</p>
                <p className="mt-3 text-xs font-semibold text-primary">Read the full document →</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="editorial-card p-5">
            <h2 className="font-display text-xl font-black">Exercise your privacy rights</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed-in Texas residents can request access, correction, deletion, portability,
              opt-out or appeal a decision.
            </p>
            <Link to="/privacy-center" className="button-primary mt-4">
              Open the Privacy Center
            </Link>
          </div>
          <div className="editorial-card p-5">
            <h2 className="font-display text-xl font-black">Refund or cancellation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Submit a refund or cancellation request tied to a payment already on your account.
              Never send card numbers.
            </p>
            <Link to="/refund-request" className="button-secondary mt-4">
              Request a refund or cancellation
            </Link>
          </div>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          How the platform actually operates day to day is documented separately on{" "}
          <Link to="/trust-method" className="underline underline-offset-4">
            Trust &amp; method
          </Link>
          .
        </p>
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
