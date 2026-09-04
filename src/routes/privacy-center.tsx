import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  listMyPrivacyRequests,
  submitPrivacyRequest,
  type PrivacyRequestType,
} from "@/lib/legal/acceptance";

export const Route = createFileRoute("/privacy-center")({
  head: () => ({
    meta: [
      { title: "Privacy Center — ProvisionLoop" },
      {
        name: "description",
        content:
          "Submit an access, correction, deletion, portability, opt-out or appeal request for the personal data ProvisionLoop holds about you.",
      },
      { property: "og:title", content: "Privacy Center — ProvisionLoop" },
      {
        property: "og:description",
        content: "Exercise your Texas data privacy rights over your ProvisionLoop account data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyCenterPage,
});

const TYPES: Array<{ id: PrivacyRequestType; label: string; blurb: string }> = [
  { id: "access", label: "Access", blurb: "Get a copy of the personal data we hold about you." },
  { id: "correction", label: "Correction", blurb: "Fix personal data that is wrong or out of date." },
  { id: "deletion", label: "Deletion", blurb: "Delete personal data we are not required to keep." },
  { id: "portability", label: "Portability", blurb: "Receive your data in a portable format." },
  {
    id: "opt_out",
    label: "Opt out",
    blurb: "Opt out of sale, targeted advertising or profiling. We do none of these today.",
  },
  { id: "appeal", label: "Appeal", blurb: "Appeal a decision we made on an earlier request." },
];

type RequestRow = Awaited<ReturnType<typeof listMyPrivacyRequests>>[number];

function PrivacyCenterPage() {
  const { user, loading } = useAuth();
  const [requestType, setRequestType] = useState<PrivacyRequestType>("access");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<RequestRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setRows(await listMyPrivacyRequests());
    } catch {
      /* row-level access only; nothing to show */
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await submitPrivacyRequest({ userId: user.id, requestType, details, contactPreference: contact });
      toast.success("Request submitted — queued for manual review.");
      setDetails("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit the request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="site-shell py-14">
        <p className="kicker text-primary">Your data</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight">Privacy Center</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Submit a request about the personal data ProvisionLoop holds about you. What we collect and
          why is set out in the <Link to="/legal/privacy">Privacy Policy</Link>.
        </p>

        <div className="editorial-card mt-6 max-w-2xl p-4 text-sm">
          <strong>Pilot limitation, stated honestly.</strong> Requests are stored privately and{" "}
          <em>queued for manual review</em> by a person. There is no automated fulfilment pipeline and
          no operational admin queue in the product yet — building it is a launch blocker before the
          public pilot opens. Under Texas law we respond within 45 days, extendable once by 60 days,
          and you may appeal a refusal.
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : !user ? (
          <div className="editorial-card mt-8 max-w-2xl p-6">
            <p className="text-sm">
              Sign in first so we can verify the request belongs to your account.
            </p>
            <Link
              to="/auth"
              search={{ redirect: "/privacy-center" }}
              className="button-primary mt-4 inline-flex"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="editorial-card mt-8 max-w-2xl space-y-5 p-6">
              <fieldset>
                <legend className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Request type
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRequestType(t.id)}
                      aria-pressed={requestType === t.id}
                      className={`rounded-lg border px-3 py-2.5 text-left transition ${
                        requestType === t.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <div className="text-sm font-medium text-foreground">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.blurb}</div>
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  What are you asking for?
                </span>
                <textarea
                  required
                  rows={5}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
                  placeholder="Describe the data or the decision your request concerns."
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  How should we reply? (optional)
                </span>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
                  placeholder="Reply to my account email"
                />
              </label>

              <p className="text-xs text-muted-foreground">
                Do not include card numbers, bank details or government ID numbers in this form.
              </p>

              <button type="submit" disabled={busy} className="button-primary disabled:opacity-60">
                {busy ? "Submitting…" : "Submit request"}
              </button>
            </form>

            <section className="mt-10 max-w-2xl">
              <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Your requests · {rows.length}
              </h2>
              {rows.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No requests yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-surface">
                  {rows.map((row) => (
                    <li key={row.id} className="p-3 text-sm">
                      <p className="font-medium capitalize">{row.request_type.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()} ·{" "}
                        {row.status.replace(/_/g, " ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
