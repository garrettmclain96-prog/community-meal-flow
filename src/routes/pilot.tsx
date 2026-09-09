import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CheckCircle2, Mail, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";
import { submitPilotLead } from "@/lib/pilot.functions";
import {
  PILOT_INTEREST_LABEL,
  PILOT_NEXT_STEP,
  PILOT_PHASE_LABEL,
  type PilotInterest,
} from "@/lib/pilot";

export const Route = createFileRoute("/pilot")({
  head: () => ({
    meta: [
      { title: "Galveston County Founding Pilot — ProvisionLoop" },
      {
        name: "description",
        content:
          "Join ProvisionLoop's Galveston County founding pilot intake as a household, kitchen, volunteer, partner or sponsor. No account, phone call or meeting is required to raise your hand.",
      },
      { property: "og:title", content: "Galveston County Founding Pilot — ProvisionLoop" },
      {
        property: "og:description",
        content:
          "A low-friction, email-first way to join ProvisionLoop's Galveston County pilot and continue through role-specific self-service steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PilotPage,
});

const ELIGIBILITY = [
  "ProvisionLoop is starting in Galveston County, Texas. Coverage expands only as real kitchen and partner capacity is verified.",
  "Household interest does not require income documents at this intake stage. Protected assistance requests have their own privacy and eligibility workflow.",
  "Kitchens must ultimately be claimed by a real operator and independently verified before they can become operational or funding-enabled.",
  "Volunteers complete the applicable waiver before protected volunteer actions. Delivery volunteers need their own transportation.",
  "Partner organizations must be approved before identifiable household information can be visible to them.",
  "Sponsors can review the model and join the pilot conversation without live checkout being enabled.",
];

const LIMITS = [
  "Pilot intake is open; a final public launch date is not being represented as confirmed yet.",
  "Live payments remain intentionally gated until the payment, legal and operational launch requirements are cleared.",
  "Most directory listings are mapped from public information and are not affiliated with ProvisionLoop unless the operator is verified.",
  "Impact numbers appear only after real ledger events close. ProvisionLoop does not pad the pilot with projected impact.",
];

const INTERESTS = Object.keys(PILOT_INTEREST_LABEL) as PilotInterest[];

function PilotPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [interest, setInterest] = useState<PilotInterest>("household");
  const [organizationName, setOrganizationName] = useState("");
  const [note, setNote] = useState("");
  const [authoritySelfDeclared, setAuthoritySelfDeclared] = useState(false);
  const [transportAvailable, setTransportAvailable] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [submittedInterest, setSubmittedInterest] = useState<PilotInterest | null>(null);
  const [wasDuplicate, setWasDuplicate] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("role") as PilotInterest | null;
    if (requested && INTERESTS.includes(requested)) setInterest(requested);
  }, []);

  const showOrganization =
    interest === "kitchen_operator" || interest === "partner" || interest === "sponsor";
  const organizationRequired = interest === "kitchen_operator" || interest === "partner";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (organizationRequired && !organizationName.trim()) {
      toast.error("Add the kitchen or organization name so the intake can be routed correctly.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source") ?? "website";
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    const leadSource = [source, medium, campaign].filter(Boolean).join("/").slice(0, 100);

    setBusy(true);
    try {
      const result = await submitPilotLead({
        data: {
          fullName,
          email,
          postalCode,
          interest,
          organizationName,
          note,
          leadSource,
          referrer: document.referrer,
          authoritySelfDeclared,
          transportAvailable,
          website,
        },
      });
      setWasDuplicate(result.duplicate);
      setSubmittedInterest(interest);
      toast.success(result.duplicate ? "Your existing pilot interest was updated." : "You're on the pilot intake list.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit right now.");
    } finally {
      setBusy(false);
    }
  }

  const next = submittedInterest ? PILOT_NEXT_STEP[submittedInterest] : null;

  return (
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="pl-page-intro">
          <div className="site-shell">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              <CalendarDays className="size-4" /> {PILOT_PHASE_LABEL} · open now
            </div>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              JOIN THE LOOP WITHOUT JOINING A MEETING.
            </h1>
            <p className="pl-page-deck">
              Pick your role, leave an email, and continue at your own pace. No phone number. No
              sales call. No account just to say you&apos;re interested. Identity, agreements and
              verification appear only when a protected workflow actually needs them.
            </p>
            <div className="pl-stage-strip">
              <div><span>01 · Raise your hand</span><strong>About one minute</strong></div>
              <div><span>02 · Self-serve</span><strong>Role-specific next step</strong></div>
              <div><span>03 · Verify</span><strong>Only where required</strong></div>
              <div><span>04 · Operate</span><strong>No meeting dependency</strong></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#signup" className="button-primary">Choose my role</a>
              <Link to="/trust-method" className="button-secondary">See how the trust model works</Link>
            </div>
          </div>
        </section>

        <section className="site-shell py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="kicker text-primary">Who can take part</p>
              <h2 className="mt-3 max-w-[10ch] font-display text-4xl font-black tracking-[-0.055em] md:text-6xl">
                LOW FRICTION. HIGH TRUST WHERE IT COUNTS.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                Interest is easy. Access to money, private data or operational authority is not.
                ProvisionLoop separates those two things on purpose.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {ELIGIBILITY.map((item, index) => (
                <article key={item} className="editorial-card pl-number-card p-5" data-index={String(index + 1).padStart(2, "0")}>
                  <CheckCircle2 className="relative z-[1] size-5 text-primary" />
                  <p className="relative z-[1] mt-4 text-sm leading-7 text-muted-foreground">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="site-shell grid gap-10 py-16 md:py-20 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <ShieldAlert className="size-7 text-primary" />
              <p className="kicker mt-5 text-primary">Current boundaries</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">WHAT WE ARE NOT PRETENDING.</h2>
            </div>
            <div className="grid gap-3">
              {LIMITS.map((limit, index) => (
                <div key={limit} className="pl-trust-note">
                  <strong className="mr-2 font-mono text-primary">0{index + 1}</strong>{limit}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="signup" className="scroll-mt-28 bg-background">
          <div className="site-shell grid gap-10 py-16 md:py-20 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="kicker text-primary">Async-first intake</p>
              <h2 className="mt-3 max-w-[10ch] font-display text-5xl font-black tracking-[-0.055em] md:text-6xl">
                PICK YOUR PLACE IN THE LOOP.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                This form is an expression of interest, not an application approval, service promise,
                funding commitment or legal acceptance. Email is the default contact method.
              </p>
              <div className="mt-6 flex items-start gap-3 border border-border bg-card p-4 text-sm">
                <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="leading-6 text-muted-foreground">
                  <strong className="text-foreground">Built for people who hate calls:</strong> you do
                  not need to provide a phone number or schedule a meeting to enter or continue the
                  pilot funnel.
                </p>
              </div>
            </div>

            {next ? (
              <div className="editorial-card p-6 md:p-8">
                <div className="grid size-12 place-items-center bg-primary text-primary-foreground">
                  <CheckCircle2 className="size-6" />
                </div>
                <p className="kicker mt-6 text-primary">{wasDuplicate ? "Interest updated" : "Interest recorded"}</p>
                <h3 className="mt-2 font-display text-4xl font-black tracking-[-0.05em]">NO CALL REQUIRED.</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  We recorded you as {PILOT_INTEREST_LABEL[submittedInterest!]}. Your default contact
                  preference is email only. You can stop here or continue immediately through the
                  next self-service step.
                </p>
                <div className="mt-6 border border-border bg-card p-5">
                  <p className="font-display text-2xl font-black">{next.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{next.description}</p>
                  <a href={next.href} className="button-primary mt-5 inline-flex">
                    {next.cta} <ArrowRight className="size-4" />
                  </a>
                </div>
                <button
                  type="button"
                  className="button-secondary mt-4"
                  onClick={() => setSubmittedInterest(null)}
                >
                  Add another role
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="editorial-card grid gap-5 p-6 md:p-8">
                <fieldset>
                  <legend className="field-label">I&apos;m here as</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {INTERESTS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={interest === key}
                        onClick={() => {
                          setInterest(key);
                          setAuthoritySelfDeclared(false);
                          setTransportAvailable(false);
                        }}
                        className={`min-h-14 border p-3 text-left text-sm font-bold transition-colors ${
                          interest === key
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border-strong bg-surface hover:border-primary/50"
                        }`}
                      >
                        {PILOT_INTEREST_LABEL[key]}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Field label="Full name">
                  <input className="field-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
                </Field>
                <Field label="Email — this is the only contact method we require">
                  <input type="email" className="field-control" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </Field>
                <Field label="ZIP code (optional)">
                  <input className="field-control" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} inputMode="numeric" placeholder="77550" autoComplete="postal-code" />
                </Field>

                {showOrganization && (
                  <Field label={`${interest === "kitchen_operator" ? "Kitchen / restaurant" : "Organization"} name${organizationRequired ? "" : " (optional)"}`}>
                    <input className="field-control" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required={organizationRequired} autoComplete="organization" />
                  </Field>
                )}

                {interest === "kitchen_operator" && (
                  <label className="flex items-start gap-3 border border-border bg-card p-4 text-sm">
                    <input type="checkbox" className="mt-1 size-4" checked={authoritySelfDeclared} onChange={(e) => setAuthoritySelfDeclared(e.target.checked)} />
                    <span className="leading-6 text-muted-foreground">
                      I own/manage this kitchen or can connect ProvisionLoop with the person who does.
                      This is routing information only — it does not count as operator verification.
                    </span>
                  </label>
                )}

                {interest === "volunteer" && (
                  <label className="flex items-start gap-3 border border-border bg-card p-4 text-sm">
                    <input type="checkbox" className="mt-1 size-4" checked={transportAvailable} onChange={(e) => setTransportAvailable(e.target.checked)} />
                    <span className="leading-6 text-muted-foreground">
                      I have my own transportation if I choose delivery work. Leave this unchecked if
                      you are interested only in non-delivery volunteer work.
                    </span>
                  </label>
                )}

                <Field label="Anything useful to know (optional)">
                  <textarea className="field-control min-h-28" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A sentence or two is enough." />
                </Field>

                <label className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
                  Website
                  <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>

                <button type="submit" className="button-primary justify-center py-4" disabled={busy}>
                  {busy ? "Submitting…" : "Raise my hand — no meeting"}
                </button>
                <p className="text-xs leading-5 text-muted-foreground">
                  No account is required for this interest form. If you continue into a protected
                  workflow, ProvisionLoop will ask you to sign in and accept the applicable current
                  legal documents before protected data or actions are available. See the{" "}
                  <Link to="/legal/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-foreground text-background">
          <div className="site-shell grid gap-6 py-12 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Prefer plain email?</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b8b2a7]">
                You can skip every conversation and send a short note to the monitored address. Email-first is a supported path, not a fallback.
              </p>
            </div>
            <a href={SUPPORT_MAILTO} className="button-secondary border-white/30 text-background">{SUPPORT_EMAIL}</a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="field-label">{label}</span><div className="mt-1">{children}</div></label>;
}
