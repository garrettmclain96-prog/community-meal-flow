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
          "Internal ProvisionLoop operations queue for privacy requests, refund requests and pilot sign-ups.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Operations Queue — ProvisionLoop Admin" },
      {
        property: "og:description",
        content: "Internal queue for privacy requests, refund requests and pilot sign-ups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Tab = "privacy" | "refunds" | "pilot";

const TABS: { key: Tab; label: string }[] = [
  { key: "privacy", label: "Privacy requests" },
  { key: "refunds", label: "Refund requests" },
  { key: "pilot", label: "Pilot sign-ups" },
];

function AdminPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("privacy");

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
                  className={
                    tab === t.key
                      ? "button-primary"
                      : "button-secondary"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-8">
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

function PrivacyQueue() {
  const q = useQuery({ queryKey: ["admin-privacy"], queryFn: listAllPrivacyRequests });
  const save = useQueueMutation("admin-privacy");
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
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
          {row.reason && <p className="mt-3 text-sm leading-6 text-muted-foreground">{row.reason}</p>}
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
