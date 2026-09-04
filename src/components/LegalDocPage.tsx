import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  legalDoc,
  type LegalDocKey,
} from "@/lib/legal/registry";

export type LegalSection = {
  id: string;
  heading: string;
  body: ReactNode;
};

export function LegalDocPage({
  docKey,
  intro,
  sections,
}: {
  docKey: LegalDocKey;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  const doc = legalDoc(docKey);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="print:hidden">
        <SiteHeader />
      </div>

      <main className="site-shell legal-doc py-12 md:py-16">
        <Link
          to="/legal"
          className="kicker text-primary underline underline-offset-4 print:hidden"
        >
          ← Legal Center
        </Link>

        <header className="mt-4 border-b-2 border-foreground pb-6">
          <h1 className="display-title text-4xl md:text-5xl">{doc.title}</h1>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="kicker text-muted-foreground">Version</dt>
              <dd className="font-semibold">{doc.version}</dd>
            </div>
            <div>
              <dt className="kicker text-muted-foreground">Effective</dt>
              <dd className="font-semibold">{LEGAL_EFFECTIVE_DATE}</dd>
            </div>
            <div>
              <dt className="kicker text-muted-foreground">Last updated</dt>
              <dd className="font-semibold">{LEGAL_LAST_UPDATED}</dd>
            </div>
            <div>
              <dt className="kicker text-muted-foreground">Applies to</dt>
              <dd className="font-semibold">ProvisionLoop Texas pilot</dd>
            </div>
          </dl>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Table of contents" className="print:hidden lg:sticky lg:top-24 lg:self-start">
            <p className="kicker text-muted-foreground">On this page</p>
            <ol className="mt-3 grid gap-1.5 text-sm">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="hover:underline underline-offset-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>{" "}
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal-prose max-w-[68ch]">
            <div className="editorial-card p-5">{intro}</div>

            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="mt-10 scroll-mt-24">
                <h2>
                  <span className="font-mono text-sm text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>{" "}
                  {section.heading}
                </h2>
                {section.body}
              </section>
            ))}

            <p className="mt-12 border-t-2 border-foreground pt-6 text-sm text-muted-foreground">
              These are platform terms for the ProvisionLoop pilot. They are not legal, financial or
              tax advice to you. The operating legal entity and a monitored legal contact channel
              must be published here before any live-money launch; until then live payments are
              disabled and all checkout runs in the payment processor&apos;s test environment.
            </p>
          </article>
        </div>
      </main>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}

export function legalHead(docKey: LegalDocKey, description: string) {
  const doc = legalDoc(docKey);
  const title = `${doc.title} v${doc.version} — ProvisionLoop`;
  return () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  });
}
