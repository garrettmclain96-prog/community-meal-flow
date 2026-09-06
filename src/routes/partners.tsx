import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, LockKeyhole, Route as RouteIcon, ShieldCheck } from "lucide-react";
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
      {
        name: "description",
        content:
          "Verified local organizations can privately receive and close food-assistance referrals through ProvisionLoop partner dispatch.",
      },
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
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="pl-page-intro bg-secondary text-secondary-foreground">
          <div className="site-shell">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]">
              <LockKeyhole className="size-4" /> Verified partner workspace
            </div>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              PRIVATE REQUESTS. ACCOUNTABLE DELIVERY.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8">
              Partner organizations are the privacy-preserving trust layer between a household request
              and a completed local outcome. Names stay private; aggregate proof closes publicly.
            </p>
            <div className="pl-stage-strip text-foreground">
              <div><span>01 · Apply</span><strong>Verify the organization</strong></div>
              <div><span>02 · Protect</span><strong>Sign data handling terms</strong></div>
              <div><span>03 · Route</span><strong>Accept assigned need</strong></div>
              <div><span>04 · Close</span><strong>Confirm the outcome</strong></div>
            </div>
          </div>
        </section>

        <section className="site-shell py-14 md:py-20">
          {!user && <SignedOut />}
          {user && workspace.isLoading && <p className="text-sm text-muted-foreground">Opening your partner workspace…</p>}
          {user && workspace.isError && (
            <p className="pl-trust-note text-destructive">
              Partner workspace could not load. No private referral data has been substituted or exposed.
            </p>
          )}
          {user && !workspace.isLoading && !workspace.data && <PartnerApplication onCreated={refresh} />}
          {workspace.data && !workspace.data.organization.approved && (
            <PendingApproval name={workspace.data.organization.name} />
          )}
          {workspace.data?.organization.approved &&
            (legal.satisfied ? (
              <DispatchQueue
                name={workspace.data.organization.name}
                referrals={workspace.data.referrals}
                onChanged={refresh}
                assertAccepted={legal.assertAccepted}
              />
            ) : (
              <div className="editorial-card mx-auto max-w-3xl p-7 md:p-9">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 size-6 shrink-0 text-primary" />
                  <div>
                    <p className="kicker text-primary">Organization verified · agreement required</p>
                    <h2 className="mt-2 font-display text-3xl font-black">UNLOCK REQUEST DETAILS RESPONSIBLY.</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {workspace.data.organization.name} is verified. Identifiable request details stay hidden until the current signed data-handling agreement is recorded to your account.
                    </p>
                  </div>
                </div>
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
    <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-stretch">
      <div className="flex flex-col justify-center">
        <p className="kicker text-primary">The trust layer</p>
        <h2 className="mt-3 max-w-xl font-display text-5xl font-black tracking-[-0.055em]">
          ALREADY SERVING GALVESTON COUNTY?
        </h2>
        <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
          Apply for verification, define your service area, receive only assigned requests, and close each referral with an outcome the network can account for.
        </p>
        <Link to="/auth" search={{ redirect: "/partners" }} className="button-primary mt-7 self-start">
          Sign in to partner
        </Link>
      </div>
      <div className="editorial-card p-6 md:p-8">
        <LockKeyhole className="size-6 text-primary" />
        <p className="kicker mt-6 text-primary">Privacy boundary</p>
        <ul className="mt-5 space-y-4 text-sm font-semibold leading-6">
          <li>01 · Recipient details are never public.</li>
          <li>02 · Only approved organizations receive assigned requests.</li>
          <li>03 · Signed data terms gate identifiable request access.</li>
          <li>04 · Fulfilled referrals require an outcome before they close.</li>
          <li>05 · Public reporting remains aggregate.</li>
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
      <div className="flex items-start gap-3">
        <Building2 className="mt-1 size-6 shrink-0 text-primary" />
        <div>
          <p className="kicker text-primary">Step 01 · Organization verification</p>
          <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.05em]">APPLY FOR DISPATCH ACCESS.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This creates a pending organization record. Private referral access stays locked until an administrator verifies the organization and service area.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Organization name" name="name" required />
        <label className="block">
          <span className="field-label">Organization type</span>
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
      <p className="pl-trust-note mt-5">Separate areas with commas. Verification is manual; submitting this form does not create partner access by itself.</p>
      {legal.gate && <div className="mt-6">{legal.gate}</div>}
      <button type="submit" disabled={busy || !legal.satisfied} className="button-primary mt-6 w-full disabled:opacity-60">
        {busy ? "Submitting…" : "Submit organization for verification"}
      </button>
    </form>
  );
}

function PendingApproval({ name }: { name: string }) {
  return (
    <div className="editorial-card mx-auto max-w-3xl p-8 md:p-10">
      <ShieldCheck className="size-7 text-primary" />
      <p className="kicker mt-6 text-primary">Verification pending</p>
      <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">{name}</h2>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
        Your application is saved. Referral details stay locked until an administrator verifies the organization and its service area. There is no provisional access while review is pending.
      </p>
    </div>
  );
}

function DispatchQueue({
  name,
  referrals,
  onChanged,
  assertAccepted,
}: {
  name: string;
  referrals: PartnerReferral[];
  onChanged: () => void;
  assertAccepted: () => Promise<void>;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-primary">Approved workspace</p>
          <h2 className="mt-2 font-display text-5xl font-black tracking-[-0.055em]">{name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Work only the requests assigned to this organization. Each card is a private operational case, not public content.
          </p>
        </div>
        <div className="border-2 border-foreground px-4 py-3 text-center">
          <p className="font-display text-3xl font-black">{referrals.length}</p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">assigned</p>
        </div>
      </div>
      <div className="mt-8 grid gap-5">
        {referrals.map((referral) => (
          <ReferralCard
            key={referral.id}
            referral={referral}
            onChanged={onChanged}
            assertAccepted={assertAccepted}
          />
        ))}
        {!referrals.length && (
          <div className="editorial-card p-7 text-muted-foreground">
            <RouteIcon className="size-6 text-primary" />
            <p className="mt-4 font-display text-xl font-black text-foreground">QUEUE CLEAR.</p>
            <p className="mt-2 text-sm">No requests are assigned right now. New requests are matched by service area.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReferralCard({
  referral,
  onChanged,
  assertAccepted,
}: {
  referral: PartnerReferral;
  onChanged: () => void;
  assertAccepted: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState("");
  const [meals, setMeals] = useState(referral.request.household_size);

  async function advance(status: string) {
    setBusy(true);
    try {
      await assertAccepted();
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
    <article className="editorial-card p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker text-primary">{needLabels[referral.request.need_type] ?? referral.request.need_type}</p>
          <h3 className="mt-2 font-display text-2xl font-black">
            {referral.request.first_name} · household of {referral.request.household_size}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{referral.request.area} · urgency: {referral.request.urgency}</p>
        </div>
        <span className="border-2 border-foreground px-3 py-1 font-mono text-xs font-bold uppercase">{referral.status}</span>
      </div>

      <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
        {referral.request.email && <a className="font-semibold underline-offset-4 hover:underline" href={`mailto:${referral.request.email}`}>{referral.request.email}</a>}
        {referral.request.phone && <a className="font-semibold underline-offset-4 hover:underline" href={`tel:${referral.request.phone}`}>{referral.request.phone}</a>}
      </div>
      {referral.request.notes && <p className="pl-trust-note mt-5 text-foreground">{referral.request.notes}</p>}

      {referral.status !== "fulfilled" && referral.status !== "declined" && (
        <div className="mt-6 flex flex-wrap gap-2">
          {referral.status === "offered" && (
            <button type="button" disabled={busy} onClick={() => void advance("accepted")} className="button-primary">Accept referral</button>
          )}
          <button type="button" disabled={busy} onClick={() => void advance("declined")} className="button-secondary">Decline</button>
        </div>
      )}

      {(referral.status === "accepted" || referral.status === "scheduled") && (
        <div className="mt-7 border-t-2 border-foreground pt-6">
          <p className="kicker text-primary">Final stage · close the loop</p>
          <p className="mt-2 text-sm text-muted-foreground">Record what was actually delivered and confirmed. This is what turns an accepted referral into a completed outcome.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
            <input aria-label="Meals delivered" type="number" min="0" value={meals} onChange={(e) => setMeals(Number(e.target.value))} className="field-control" />
            <input aria-label="Outcome note" value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="What was delivered and confirmed?" className="field-control" />
            <button type="button" disabled={busy || outcome.trim().length < 2} onClick={() => void advance("fulfilled")} className="button-primary">
              Verify fulfilled
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input name={name} className="field-control" {...props} />
    </label>
  );
}