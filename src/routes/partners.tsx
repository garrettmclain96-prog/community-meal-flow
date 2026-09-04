import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useLegalGate } from "@/hooks/useLegalGate";
import { BASE_DOCS, type LegalDocKey } from "@/lib/legal/registry";
import {
  applyPartner,
  getPartnerWorkspace,
  type PartnerReferral,
  updateReferral,
} from "@/lib/partners";

const PARTNER_DOCS: LegalDocKey[] = [...BASE_DOCS, "partner_data"];

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partner Dispatch — ProvisionLoop" },
      { name: "description", content: "Private assistance routing for local partners." },
    ],
  }),
  component: PartnersPage,
});

const needLabels: Record<string, string> = {
  meal_today: "Meal today",
  groceries: "Groceries",
  ongoing_meals: "Ongoing meals",
  senior_support: "Senior support",
  child_support: "Child support",
  disaster: "Disaster response",
};

function PartnersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const workspace = useQuery({
    queryKey: ["partner-workspace", user?.id],
    queryFn: getPartnerWorkspace,
    enabled: Boolean(user),
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["partner-workspace"] });
  const legal = useLegalGate({
    documents: PARTNER_DOCS,
    requireSignature: true,
    context: "partner_workspace_access",
    intro:
      "Identifiable assistance requests are only shown once an authorized person at your organization signs the data-handling agreement.",
  });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b-2 border-foreground bg-secondary text-secondary-foreground">
          <div className="site-shell py-16 md:py-24">
            <p className="kicker">ProvisionLoop partner dispatch</p>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              PRIVATE REQUESTS. ACCOUNTABLE DELIVERY.
            </h1>
            <p className="mt-5 max-w-2xl font-semibold leading-7">
              Local organizations review need, coordinate a kitchen and close the loop. Recipient
              identities stay out of the public ledger; verified totals do not.
            </p>
          </div>
        </section>

        <section className="site-shell py-14 md:py-20">
          {!user && <SignedOut />}
          {user && workspace.isLoading && <p>Loading your partner workspace…</p>}
          {user && workspace.isError && (
            <p className="editorial-card p-5 text-destructive">
              Partner workspace could not load. Deploy the latest database migration first.
            </p>
          )}
          {user && !workspace.isLoading && !workspace.data && (
            <PartnerApplication onCreated={refresh} />
          )}
          {workspace.data && !workspace.data.organization.approved && (
            <PendingApproval name={workspace.data.organization.name} />
          )}
          {workspace.data?.organization.approved &&
            (legal.satisfied ? (
              <DispatchQueue
                name={workspace.data.organization.name}
                referrals={workspace.data.referrals}
                onChanged={refresh}
              />
            ) : (
              <div className="mx-auto max-w-3xl">
                <p className="kicker text-primary">Agreement required</p>
                <h2 className="mt-2 font-display text-3xl font-black">
                  Sign before request details open
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {workspace.data.organization.name} is verified. Identifiable request details stay
                  hidden until the signed agreement is recorded to your account.
                </p>
                <div className="mt-6">{legal.gate}</div>
              </div>
            ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SignedOut() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="kicker text-primary">The trust layer</p>
        <h2 className="mt-3 font-display text-4xl font-black">Already serving Galveston County?</h2>
        <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
          Apply for verification and work referrals from acceptance through confirmed delivery.
        </p>
        <Link to="/auth" search={{ redirect: "/partners" }} className="button-primary mt-7">
          Sign in to partner
        </Link>
      </div>
      <div className="editorial-card p-6">
        <p className="kicker">Privacy boundary</p>
        <ul className="mt-4 space-y-3 text-sm font-semibold">
          <li>Recipient details are never public.</li>
          <li>Only approved members see assigned requests.</li>
          <li>Every fulfilled referral requires an outcome.</li>
          <li>Public reports contain aggregate counts only.</li>
        </ul>
      </div>
    </div>
  );
}

function PartnerApplication({ onCreated }: { onCreated: () => void }) {
  const [busy, setBusy] = useState(false);
  const legal = useLegalGate({
    documents: PARTNER_DOCS,
    requireSignature: true,
    context: "partner_application",
    intro:
      "Applying for dispatch access is a data-handling commitment, so it is signed. Acceptance is saved before the application is submitted.",
  });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await legal.assertAccepted();
      await applyPartner({
        name: String(form.get("name") ?? ""),
        kind: String(form.get("kind") ?? "nonprofit"),
        website: String(form.get("website") ?? ""),
        serviceAreas: String(form.get("areas") ?? "")
          .split(",")
          .map((area) => area.trim())
          .filter(Boolean),
      });
      toast.success("Application submitted");
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Application failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="editorial-card mx-auto max-w-3xl p-6 md:p-9">
      <p className="kicker text-primary">Organization verification</p>
      <h2 className="mt-3 font-display text-3xl font-black">Apply for dispatch access</h2>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Organization name" name="name" required />
        <label className="grid gap-2 text-sm font-bold">
          Organization type
          <select name="kind" className="field-control">
            <option value="nonprofit">Nonprofit</option>
            <option value="food_bank">Food bank</option>
            <option value="school">School</option>
            <option value="faith_community">Faith community</option>
            <option value="public_agency">Public agency</option>
          </select>
        </label>
        <Field label="Website" name="website" type="url" placeholder="https://…" />
        <Field label="Service areas" name="areas" required placeholder="Galveston, Texas City" />
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Separate areas with commas. Request access stays locked until an administrator verifies the
        organization.
      </p>
      {legal.gate && <div className="mt-6">{legal.gate}</div>}
      <button type="submit" disabled={busy || !legal.satisfied} className="button-primary mt-6">
        {busy ? "Submitting…" : "Submit for verification"}
      </button>
    </form>
  );
}

function PendingApproval({ name }: { name: string }) {
  return (
    <div className="editorial-card mx-auto max-w-3xl p-8">
      <p className="kicker text-primary">Verification pending</p>
      <h2 className="mt-3 font-display text-4xl font-black">{name}</h2>
      <p className="mt-4 leading-7 text-muted-foreground">
        Your application is saved. Referral details stay locked until an administrator verifies the
        organization and service area.
      </p>
    </div>
  );
}

function DispatchQueue({
  name,
  referrals,
  onChanged,
}: {
  name: string;
  referrals: PartnerReferral[];
  onChanged: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-primary">Approved workspace</p>
          <h2 className="mt-2 font-display text-4xl font-black">{name}</h2>
        </div>
        <p className="font-mono text-sm font-bold">{referrals.length} assigned requests</p>
      </div>
      <div className="mt-8 grid gap-5">
        {referrals.map((referral) => (
          <ReferralCard key={referral.id} referral={referral} onChanged={onChanged} />
        ))}
        {!referrals.length && (
          <div className="editorial-card p-7 text-muted-foreground">
            No requests are assigned right now. New requests are matched by service area.
          </div>
        )}
      </div>
    </div>
  );
}

function ReferralCard({
  referral,
  onChanged,
}: {
  referral: PartnerReferral;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState("");
  const [meals, setMeals] = useState(referral.request.household_size);
  async function advance(status: string) {
    setBusy(true);
    try {
      await updateReferral({ referralId: referral.id, status, outcome, meals });
      toast.success(status === "fulfilled" ? "Fulfillment verified" : `Referral ${status}`);
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="editorial-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">
            {needLabels[referral.request.need_type] ?? referral.request.need_type}
          </p>
          <h3 className="mt-2 font-display text-2xl font-black">
            {referral.request.first_name} · household of {referral.request.household_size}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {referral.request.area} · urgency: {referral.request.urgency}
          </p>
        </div>
        <span className="border-2 border-foreground px-3 py-1 font-mono text-xs font-bold uppercase">
          {referral.status}
        </span>
      </div>
      <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
        {referral.request.email && (
          <a href={`mailto:${referral.request.email}`}>{referral.request.email}</a>
        )}
        {referral.request.phone && (
          <a href={`tel:${referral.request.phone}`}>{referral.request.phone}</a>
        )}
      </div>
      {referral.request.notes && (
        <p className="mt-4 border-l-4 border-primary pl-4 text-sm">{referral.request.notes}</p>
      )}
      {referral.status !== "fulfilled" && referral.status !== "declined" && (
        <div className="mt-6 flex flex-wrap gap-2">
          {referral.status === "offered" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void advance("accepted")}
              className="button-secondary"
            >
              Accept
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void advance("declined")}
            className="button-secondary"
          >
            Decline
          </button>
        </div>
      )}
      {(referral.status === "accepted" || referral.status === "scheduled") && (
        <div className="mt-6 border-t-2 border-foreground pt-5">
          <p className="kicker">Close the loop</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
            <input
              aria-label="Meals delivered"
              type="number"
              min="0"
              value={meals}
              onChange={(e) => setMeals(Number(e.target.value))}
              className="field-control"
            />
            <input
              aria-label="Outcome note"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="What was delivered and confirmed?"
              className="field-control"
            />
            <button
              type="button"
              disabled={busy || outcome.trim().length < 2}
              onClick={() => void advance("fulfilled")}
              className="button-primary"
            >
              Verify fulfilled
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input name={name} className="field-control" {...props} />
    </label>
  );
}
