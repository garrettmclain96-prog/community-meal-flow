import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout/return")({
  head: () => ({
    meta: [
      { title: "Payment complete — TableForward" },
      {
        name: "description",
        content:
          "Your TableForward payment is confirmed and the funded meals are now recorded in the public impact ledger.",
      },
      { property: "og:title", content: "Payment complete — TableForward" },
      {
        property: "og:description",
        content: "Funded meals are recorded in the public impact ledger.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();

  const checkout = useQuery({
    queryKey: ["checkout", sessionId],
    enabled: Boolean(sessionId),
    refetchInterval: (query) => (query.state.data?.status === "paid" ? false : 2000),
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsor_checkouts")
        .select("id, meals, amount_cents, status, neighborhood")
        .eq("stripe_session_id", sessionId!)
        .maybeSingle();
      return data;
    },
  });

  const record = checkout.data;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ember-text">TableForward</p>
        {!sessionId && (
          <>
            <h1 className="mt-3 font-display text-3xl font-bold">No payment found</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This page is shown after a checkout completes.
            </p>
          </>
        )}
        {sessionId && record?.status === "paid" && (
          <>
            <h1 className="mt-3 font-display text-3xl font-bold">Payment confirmed</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {record.meals} meals funded — ${(record.amount_cents / 100).toFixed(2)}
              {record.neighborhood ? ` in ${record.neighborhood}` : ""}. It is now visible in the
              public impact ledger, and the kitchen has been notified.
            </p>
          </>
        )}
        {sessionId && record && record.status !== "paid" && (
          <>
            <h1 className="mt-3 font-display text-3xl font-bold">Confirming your payment…</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Meals post to the ledger the moment the payment settles. This page updates itself.
            </p>
          </>
        )}
        {sessionId && !record && !checkout.isLoading && (
          <>
            <h1 className="mt-3 font-display text-3xl font-bold">Thank you</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your sponsorship is being activated. It will appear in the Impact portal shortly.
            </p>
          </>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/impact"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Back to Impact
          </Link>
          <Link to="/" className="rounded-xl border border-border px-5 py-2.5 text-sm">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
