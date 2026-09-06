import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  ADMIN_STATUSES,
  ADMIN_STATUS_LABEL,
  isPlatformAdmin,
  listAllPilotSignups,
  listAllPrivacyRequests,
  listAllRefundRequests,
  listPendingKitchenClaims,
  listPendingKitchenRegistrations,
  reviewKitchenClaim,
  reviewKitchenRegistration,
  updateQueueRow,
  type AdminStatus,
} from "@/lib/admin";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";
import { PILOT_INTEREST_LABEL, type PilotInterest } from "@/lib/pilot";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Operations Queue — ProvisionLoop Admin" },
      {
        name: "description",
        content:
          "Internal ProvisionLoop operations queue for provider verification, privacy requests, refunds and pilot sign-ups.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Operations Queue — ProvisionLoop Admin" },
      {
        property: "og:description",
        content: "Internal ProvisionLoop operations and provider verification queue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Tab = "kitchens" | "privacy" | "refunds" | "pilot";

const TABS: { key: Tab; label: string }[] = [
  { key: "kitchens", label: "Provider verification" },
  { key: "privacy", label: "Privacy requests" },
  { key: "refunds", label: "Refund requests" },
  { key: "pilot", label: "Pilot sign-ups" },
];

function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("kitchens");

  const admin = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: Boolean(user),
    queryFn: () => isPlatformAdmin(user!.id),
  });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main className="site-shell py-14">
        <p className="kicker text-primary">Internal</p>
        <h1 className="display-title mt-4 text-4xl md:text-6xl">OPERATIONS QUEUE.</h1>

        {loading || (user && admin.isLoading) ? (
          <p className="mt-8 text-sm text-muted-foreground">Checking access…</p>
        ) : !user ? (
          <div className="editorial-card mt-8 max-w-xl p-6">
            <p className="text-sm text-muted-foreground">
              Sign in with an administrator account to open the operations queue.
            </p>
            <Link
              to="/auth"
              search={{ redirect: "/admin" }}
              className="button-primary mt-5 inline-flex"
            >
              Sign in
            </Link>
          </div>
        ) : admin.isError ? (
          <div className="mt-8 max-w-xl">
            <ErrorState
              title="Could not verify administrator access"
              error={admin.error}
              onRetry={() => void admin.refetch()}
            />
          </div>
        ) : !admin.data ? (
          <div className="editorial-card mt-8 max-w-xl p-6">
            <p className="font-display text-xl font-black">Not authorized.</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This queue is limited to ProvisionLoop platform administrators. If you submitted a
              privacy or refund request, you can track it from your own account instead.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/privacy-center" className="button-secondary">
                Privacy Center
              </Link>
              <Link to="/refund-request" className="button-secondary">
                Refund request
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Need help?{" "}
              <a href={SUPPORT_MAILTO} className="underline underline-offset-4">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={tab === t.key ? "button-primary" : "button-secondary"}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-8">
              {tab === "kitchens" && <KitchenVerificationQueue />}
              {tab === "privacy" && <PrivacyQueue />}
              {tab === "refunds" && <RefundQueue />}
              {tab === "pilot" && <PilotQueue />}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function useQueueMutation(queryKey: string) {
  const queryClient = useQueryClient();
  return async (
    table: "privacy_requests" | "refund_requests" | "pilot_signups",
    id: string,
    status: AdminStatus,
    note: string,
  ) => {
    try {
      await updateQueueRow(table, id, { status, internal_note: note.trim() || null });
      toast.success("Updated.");
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    }
  };
}

function StatusControls({
  status,
  note,
  onSave,
}: {
  status: string;
  note: string | null;
  onSave: (status: AdminStatus, note: string) => void | Promise<void>;
}) {
  const [next, setNext] = useState<AdminStatus>(
    (ADMIN_STATUSES as readonly string[]).includes(status)
      ? (status as AdminStatus)
      : "queued_manual_review",
  );
  const [internal, setInternal] = useState(note ?? "");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-[180px_1fr_auto] sm:items-start">
      <select
        className="input-field"
        value={next}
        onChange={(e) => setNext(e.target.value as AdminStatus)}
      >
        {ADMIN_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ADMIN_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <input
        className="input-field"
        placeholder="Internal note"
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
      />
      <button
        type="button"
        className="button-secondary justify-center"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onSave(next, internal);
          setBusy(false);
        }}
      >
        Save
      </button>
    </div>
  );
}

function age(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  return `${days}d old`;
}

function EmptyState({ what }: { what: string }) {
  return <p className="text-sm text-muted-foreground">No {what} yet.</p>;
}

function ErrorState({
  title,
  error,
  onRetry,
}: {
  title: string;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="editorial-card border-red-500/40 p-6">
      <p className="font-display text-lg font-black">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "The database request failed."}
      </p>
      <button type="button" className="button-secondary mt-4" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

function KitchenVerificationQueue() {
  const queryClient = useQueryClient();
  const claims = useQuery({
    queryKey: ["admin-kitchen-claims"],
    queryFn: listPendingKitchenClaims,
  });
  const registrations = useQuery({
    queryKey: ["admin-kitchen-registrations"],
    queryFn: listPendingKitchenRegistrations,
  });
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-claims"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-registrations"] }),
    ]);
  }

  async function decide(kind: "claim" | "registration", id: string, approve: boolean) {
    setBusy(`${kind}:${id}:${approve ? "approve" : "reject"}`);
    try {
      if (kind === "claim") await reviewKitchenClaim(id, approve);
      else await reviewKitchenRegistration(id, approve);
      toast.success(approve ? "Provider approved." : "Provider request rejected.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Provider review failed.");
    } finally {
      setBusy(null);
    }
  }

  if (claims.isLoading || registrations.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading provider verification…</p>;
  }
  if (claims.isError) {
    return (
      <ErrorState
        title="Kitchen claim queue failed to load"
        error={claims.error}
        onRetry={() => void claims.refetch()}
      />
    );
  }
  if (registrations.isError) {
    return (
      <ErrorState
        title="Kitchen registration queue failed to load"
        error={registrations.error}
        onRetry={() => void registrations.refetch()}
      />
    );
  }

  const claimRows = claims.data ?? [];
  const registrationRows = registrations.data ?? [];

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker text-primary">Existing listings</p>
            <h2 className="mt-2 font-display text-2xl font-black">Pending operator claims</h2>
          </div>
          <span className="kicker border border-border px-2 py-1 text-[10px]">
            {claimRows.length} pending
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Approving a claim grants that account ownership of the mapped listing. Rejecting it leaves
          the public directory listing unaffiliated and unfundable.
        </p>

        <div className="mt-5 grid gap-4">
          {claimRows.length === 0 && <EmptyState what="pending kitchen claims" />}
          {claimRows.map((row) => (
            <article key={row.id} className="editorial-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-black">{row.kitchen_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.neighborhood || row.city || "Area not provided"}
                  </p>
                </div>
                <span className="kicker border border-amber-500/50 px-2 py-1 text-[10px] text-amber-700 dark:text-amber-300">
                  Pending verification
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>Claimant: {row.user_id}</p>
                {row.role_at_kitchen && <p>Role: {row.role_at_kitchen}</p>}
                {row.note && <p className="pt-2 leading-6">{row.note}</p>}
                <p className="pt-2 text-xs">Submitted {new Date(row.created_at).toLocaleString()}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  className="button-primary"
                  disabled={busy !== null}
                  onClick={() => void decide("claim", row.id, true)}
                >
                  {busy === `claim:${row.id}:approve` ? "Approving…" : "Approve claim"}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  disabled={busy !== null}
                  onClick={() => void decide("claim", row.id, false)}
                >
                  {busy === `claim:${row.id}:reject` ? "Rejecting…" : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker text-primary">New providers</p>
            <h2 className="mt-2 font-display text-2xl font-black">Pending registrations</h2>
          </div>
          <span className="kicker border border-border px-2 py-1 text-[10px]">
            {registrationRows.length} pending
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          New registrations remain private, inactive and unfundable until you approve them here.
        </p>

        <div className="mt-5 grid gap-4">
          {registrationRows.length === 0 && <EmptyState what="pending kitchen registrations" />}
          {registrationRows.map((row) => (
            <article key={row.id} className="editorial-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-black">{row.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.neighborhood || row.city} · {row.kind.replaceAll("_", " ")}
                  </p>
                </div>
                <span className="kicker border border-amber-500/50 px-2 py-1 text-[10px] text-amber-700 dark:text-amber-300">
                  Pending verification
                </span>
              </div>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>Owner account: {row.owner_id ?? "missing"}</p>
                {row.address && <p>{row.address}</p>}
                {row.website && (
                  <p>
                    Website: <span className="break-all">{row.website}</span>
                  </p>
                )}
                {row.summary && <p className="pt-2 leading-6">{row.summary}</p>}
                <p className="pt-2 text-xs">Submitted {new Date(row.created_at).toLocaleString()}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  className="button-primary"
                  disabled={busy !== null}
                  onClick={() => void decide("registration", row.id, true)}
                >
                  {busy === `registration:${row.id}:approve` ? "Approving…" : "Approve provider"}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  disabled={busy !== null}
                  onClick={() => void decide("registration", row.id, false)}
                >
                  {busy === `registration:${row.id}:reject` ? "Rejecting…" : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PrivacyQueue() {
  const q = useQuery({ queryKey: ["admin-privacy"], queryFn: listAllPrivacyRequests });
  const save = useQueueMutation("admin-privacy");
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (q.isError)
    return (
      <ErrorState
        title="Privacy queue failed to load"
        error={q.error}
        onRetry={() => void q.refetch()}
      />
    );
  if (!q.data?.length) return <EmptyState what="privacy requests" />;
  return (
    <div className="grid gap-4">
      {q.data.map((row) => (
        <article key={row.id} className="editorial-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker border border-border-strong px-2 py-1 text-[10px]">
              {row.request_type}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString()} · {age(row.created_at)}
            </span>
            <span className="kicker text-primary">{row.status}</span>
          </div>
          {row.details && (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{row.details}</p>
          )}
          {row.contact_preference && (
            <p className="mt-2 text-xs text-muted-foreground">
              Contact preference: {row.contact_preference}
            </p>
          )}
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            requester {row.user_id.slice(0, 8)}… · ref {row.id.slice(0, 8)}
          </p>
          <StatusControls
            status={row.status}
            note={row.internal_note}
            onSave={(s, n) => save("privacy_requests", row.id, s, n)}
          />
        </article>
      ))}
    </div>
  );
}

function RefundQueue() {
  const q = useQuery({ queryKey: ["admin-refunds"], queryFn: listAllRefundRequests });
  const save = useQueueMutation("admin-refunds");
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (q.isError)
    return (
      <ErrorState
        title="Refund queue failed to load"
        error={q.error}
        onRetry={() => void q.refetch()}
      />
    );
  if (!q.data?.length) return <EmptyState what="refund requests" />;
  return (
    <div className="grid gap-4">
      {q.data.map((row) => (
        <article key={row.id} className="editorial-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker border border-border-strong px-2 py-1 text-[10px]">
              {row.request_type}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString()} · {age(row.created_at)}
            </span>
            <span className="kicker text-primary">{row.status}</span>
          </div>
          {row.reason && (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{row.reason}</p>
          )}
          {row.reference_id && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              payment reference {row.reference_id}
            </p>
          )}
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            requester {row.user_id.slice(0, 8)}… · ref {row.id.slice(0, 8)}
          </p>
          <StatusControls
            status={row.status}
            note={row.internal_note}
            onSave={(s, n) => save("refund_requests", row.id, s, n)}
          />
        </article>
      ))}
    </div>
  );
}

function PilotQueue() {
  const q = useQuery({ queryKey: ["admin-pilot"], queryFn: listAllPilotSignups });
  const save = useQueueMutation("admin-pilot");
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (q.isError)
    return (
      <ErrorState
        title="Pilot queue failed to load"
        error={q.error}
        onRetry={() => void q.refetch()}
      />
    );
  if (!q.data?.length) return <EmptyState what="pilot sign-ups" />;
  return (
    <div className="grid gap-4">
      {q.data.map((row) => (
        <article key={row.id} className="editorial-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker border border-border-strong px-2 py-1 text-[10px]">
              {PILOT_INTEREST_LABEL[row.interest as PilotInterest] ?? row.interest}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString()} · {age(row.created_at)}
            </span>
            <span className="kicker text-primary">{row.status}</span>
          </div>
          <p className="mt-3 text-sm text-foreground">
            {row.full_name} · {row.email}
            {row.postal_code ? ` · ${row.postal_code}` : ""}
          </p>
          {row.note && <p className="mt-2 text-sm leading-6 text-muted-foreground">{row.note}</p>}
          <StatusControls
            status={row.status}
            note={row.internal_note}
            onSave={(s, n) => save("pilot_signups", row.id, s, n)}
          />
        </article>
      ))}
    </div>
  );
}
