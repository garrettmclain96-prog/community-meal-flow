import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { getDesignDashboard } from "@/lib/design.functions";

export const Route = createFileRoute("/design")({
  head: () => ({
    meta: [
      { title: "Design Dashboard — ProvisionLoop" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DesignDashboard,
});

function DesignDashboard() {
  const { user, loading } = useAuth();
  const query = useQuery({
    queryKey: ["design-dashboard", user?.id],
    queryFn: () => getDesignDashboard(),
    enabled: Boolean(user),
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });
  const docs = query.data?.authorized ? query.data.docs : [];
  const statuses = docs.reduce<Record<string, number>>((counts, doc) => {
    counts[doc.status] = (counts[doc.status] ?? 0) + 1;
    return counts;
  }, {});
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="site-shell py-14">
        <p className="kicker text-primary">Internal · Platform administration</p>
        <h1 className="display-title mt-4 text-4xl md:text-6xl">DESIGN DASHBOARD.</h1>
        {loading || (user && query.isLoading) ? (
          <p className="mt-8 text-muted-foreground">Checking access…</p>
        ) : !user ? (
          <div className="glass rounded-2xl mt-8 max-w-xl p-6">
            <p>Sign in with an administrator account to open the design dashboard.</p>
            <Link
              to="/auth"
              search={{ redirect: "/design" }}
              className="button-primary mt-5 inline-flex"
            >
              Sign in
            </Link>
          </div>
        ) : query.isError ? (
          <div role="alert" className="glass rounded-2xl mt-8 p-6">
            <p>Unable to verify access or load design documents.</p>
            <button className="button-secondary mt-4" onClick={() => void query.refetch()}>
              Retry
            </button>
          </div>
        ) : !query.data?.authorized ? (
          <div className="glass rounded-2xl mt-8 max-w-xl p-6">
            <p className="font-display text-xl font-black">Not authorized.</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This dashboard is limited to ProvisionLoop platform administrators.
            </p>
            <Link to="/" className="button-secondary mt-5 inline-flex">
              Return home
            </Link>
          </div>
        ) : (
          <>
            <dl
              className="glass rounded-2xl mt-8 flex flex-wrap gap-8 p-6"
              aria-label="Design summary"
            >
              {[
                ["Total docs", docs.length],
                ...Object.entries(statuses),
                ["Open questions", docs.reduce((n, doc) => n + doc.questions.length, 0)],
              ].map(([label, count]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-2 font-display text-3xl font-black">{count}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              Sorted by priority, status, then latest update. Documents reflect this build.
            </p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {docs.map((doc) => (
                <article key={doc.path} className="glass rounded-2xl min-w-0 p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="kicker text-primary">
                      {doc.priority} · {doc.domain}
                    </span>
                    <span className="rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs text-primary">
                      {doc.status}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-black">{doc.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    v{doc.version} · Updated {doc.lastUpdated || "Unknown"} · {doc.owner}
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                    {doc.path}
                  </p>
                  <details className="mt-5 border-t border-border pt-4">
                    <summary className="cursor-pointer font-semibold">
                      Open questions ({doc.questions.length})
                    </summary>
                    {doc.questions.length ? (
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                        {doc.questions.map((question, i) => (
                          <li key={i}>{question}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No open questions recorded.
                      </p>
                    )}
                  </details>
                  <h3 className="mt-5 font-semibold">Architecture decisions ({doc.adrs.length})</h3>
                  {doc.adrs.length ? (
                    doc.adrs.map((adr) => (
                      <details key={adr.path} className="mt-3 rounded-xl border border-border p-3">
                        <summary className="cursor-pointer text-sm">
                          {adr.title} <span className="text-primary">· {adr.status}</span>
                        </summary>
                        <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-muted-foreground">
                          {adr.content}
                        </pre>
                      </details>
                    ))
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No ADRs linked.</p>
                  )}
                </article>
              ))}
            </div>
            {!docs.length && <p className="mt-8">No design documents found in this build.</p>}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
