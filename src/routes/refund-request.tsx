import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  listMyRefundRequests,
  submitRefundRequest,
  type RefundRequestType,
} from "@/lib/legal/acceptance";

export const Route = createFileRoute("/refund-request")({
  head: () => ({
    meta: [
      { title: "Refund & cancellation request — ProvisionLoop" },
      {
        name: "description",
        content:
          "Ask ProvisionLoop to cancel a sponsorship or review a refund for meal funding. Requests are stored privately and reviewed by a person.",
      },
      { property: "og:title", content: "Refund & cancellation request — ProvisionLoop" },
      {
        property: "og:description",
        content: "Cancel a sponsorship or request a refund review for a ProvisionLoop payment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RefundRequestPage,
});

const TYPES: Array<{ id: RefundRequestType; label: string; blurb: string }> = [
  {
    id: "refund",
    label: "Refund a one-time funding",
    blurb: "Meals you funded that were not produced.",
  },
  {
    id: "cancel_subscription",
    label: "Cancel a sponsorship",
    blurb: "Stop future renewals of a recurring sponsorship.",
  },
  { id: "duplicate", label: "Duplicate charge", blurb: "You were charged more than once." },
  {
    id: "unauthorized",
    label: "Unauthorized charge",
    blurb: "You did not authorize this payment.",
  },
  { id: "error", label: "Amount entered in error", blurb: "Wrong meal count or wrong kitchen." },
];

type RequestRow = Awaited<ReturnType<typeof listMyRefundRequests>>[number];

function RefundRequestPage() {
  const { user, loading } = useAuth();
  const [requestType, setRequestType] = useState<RefundRequestType>("refund");
  const [referenceId, setReferenceId] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<RequestRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setRows(await listMyRefundRequests());
    } catch {
      /* row-level access only */
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
      await submitRefundRequest({ userId: user.id, requestType, referenceId, reason });
      toast.success("Request submitted — queued for manual review.");
      setReason("");
      setReferenceId("");
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
        <p className="kicker text-primary">Payments</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight">
          Refund &amp; cancellation request
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          The rules that apply are in the{" "}
          <Link to="/legal/refunds">Refund &amp; Cancellation Policy</Link>. In short: one-time
          funding can be cancelled before a kitchen accepts, and sponsorships stop before the next
          renewal.
        </p>

        <div className="editorial-card mt-6 max-w-2xl p-4 text-sm">
          <strong>Never send card details.</strong> Do not enter a card number, CVC, expiry or bank
          account number here. Use only the payment or subscription identifier shown in your
          account.
          <br />
          <br />
          Requests are <em>queued for manual review</em> — submitting this form does not
          automatically issue a refund. There is no automated refund pipeline or admin queue yet;
          that is a launch blocker before live money is accepted.
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : !user ? (
          <div className="editorial-card mt-8 max-w-2xl p-6">
            <p className="text-sm">Sign in with the account that made the payment.</p>
            <Link
              to="/auth"
              search={{ redirect: "/refund-request" }}
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
                <div className="mt-3 grid gap-2">
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
                  Payment or subscription identifier
                </span>
                <input
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
                  placeholder="The identifier shown in your funding history"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  What happened?
                </span>
                <textarea
                  required
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
                />
              </label>

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
                      <p className="font-medium capitalize">
                        {row.request_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()} ·{" "}
                        {row.status.replace(/_/g, " ")}
                        {row.reference_id ? ` · ${row.reference_id}` : ""}
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
