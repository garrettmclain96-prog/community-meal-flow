import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useLegalGate } from "@/hooks/useLegalGate";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";
import { BASE_DOCS } from "@/lib/legal/registry";
import {
  PILOT_INTEREST_LABEL,
  PILOT_LIVE_DATE,
  listMyPilotSignups,
  submitPilotSignup,
  type PilotInterest,
} from "@/lib/pilot";

export const Route = createFileRoute("/pilot")({
  head: () => ({
    meta: [
      { title: "Galveston County Pilot — ProvisionLoop Goes Live Nov 3, 2026" },
      {
        name: "description",
        content:
          "ProvisionLoop's Galveston County food coordination pilot opens November 3, 2026. Read the eligibility criteria and sign up as a household, kitchen, volunteer, partner or sponsor.",
      },
      { property: "og:title", content: "Galveston County Pilot — ProvisionLoop" },
      {
        property: "og:description",
        content:
          "Live date, eligibility criteria and sign-up for the ProvisionLoop Galveston County pilot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PilotPage,
});

const ELIGIBILITY = [
  "You live in Galveston County, Texas. Coverage starts in Galveston, Texas City and La Marque and expands as kitchen capacity allows.",
  "No income documentation is required during the pilot. We do not ask for pay stubs, benefit letters or immigration status.",
  "Household requests are routed through a verified community partner organization, which applies its own eligibility and safeguarding practices.",
  "Kitchens must be claimed by their real operator and must complete payment-processor payout onboarding before they can be funded.",
  "Volunteers must be 18 or older, complete the volunteer waiver, and provide their own transportation for delivery runs.",
  "Partner organizations must apply and be approved before any identifiable household data is visible to them.",
];

const LIMITS = [
  "Nights, weekends and rural west-county coverage may be thin at launch.",
  "Payments remain in the configured test environment until live Stripe credentials, webhooks and payout onboarding are operationally certified.",
  "Most directory listings are unclaimed local programs and are never fundable.",
  "Impact numbers appear only after ledger events close; ProvisionLoop does not pad the pilot with projected impact.",
];

const INTERESTS = Object.keys(PILOT_INTEREST_LABEL) as PilotInterest[];

function PilotPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const legal = useLegalGate({
    documents: BASE_DOCS,
    context: "pilot_signup",
    intro:
      "Signing up for the pilot requires accepting these two documents at their current version.",
  });

  const mine = useQuery({
    queryKey: ["pilot-signups", user?.id],
    enabled: Boolean(user),
    queryFn: listMyPilotSignups,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [interest, setInterest] = useState<PilotInterest>("household");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) {
      toast.error("Sign in first so your pilot sign-up and agreement are recorded to your account.");
      return;
    }
    try {
      await legal.assertAccepted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Acceptance required.");
      return;
    }
    if (!fullName.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setBusy(true);
    try {
      await submitPilotSignup({ userId: user.id, fullName, email, postalCode, interest, note });
      toast.success("You're on the pilot list. We'll contact you at the address you gave.");
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["pilot-signups", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="pl-page-intro">
          <div className="site-shell">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              <CalendarDays className="size-4" /> Public pilot · {PILOT_LIVE_DATE}
            </div>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              PROVE IT HERE BEFORE WE SCALE IT ANYWHERE.
            </h1>
            <p className="pl-page-deck">
              Galveston County is ProvisionLoop&apos;s proving ground. The pilot is where households,
              kitchens, volunteers, partners and sponsors test one operating model together — with
              privacy boundaries, verification states and public proof built in from day one.
            </p>
            <div className="pl-stage-strip">
              <div><span>01 · Join</span><strong>Choose your role</strong></div>
              <div><span>02 · Verify</span><strong>Clear the right gate</strong></div>
              <div><span>03 · Operate</span><strong>Use the live workflow</strong></div>
              <div><span>04 · Learn</span><strong>Improve from real outcomes</strong></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#signup" className="button-primary">Join the pilot list</a>
              <Link to="/trust-method" className="button-secondary">See exactly how it works</Link>
            </div>
          </div>
        </section>

        <section className="site-shell py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="kicker text-primary">Who can take part</p>
              <h2 className="mt-3 max-w-[10ch] font-display text-4xl font-black tracking-[-0.055em] md:text-6xl">
                THE RULES ARE PART OF THE PRODUCT.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                Different actors carry different risk. The pilot does not flatten those roles into one generic sign-up.
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
              <p className="kicker mt-5 text-primary">Known limits at launch</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.05em]">WHAT WE ARE NOT PROMISING.</h2>
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
              <p className="kicker text-primary">Get in line</p>
              <h2 className="mt-3 max-w-[10ch] font-display text-5xl font-black tracking-[-0.055em] md:text-6xl">
                PICK YOUR PLACE IN THE LOOP.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                Pilot sign-up is interest and onboarding coordination — not a promise of service,
                funding, acceptance or coverage. Your role determines the verification steps that come next.
              </p>
              {mine.data && mine.data.length > 0 && (
                <div className="mt-7">
                  <p className="kicker text-primary">Your sign-ups</p>
                  <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    {mine.data.map((row) => (
                      <li key={row.id} className="editorial-card p-4">
                        <span className="font-semibold text-foreground">
                          {PILOT_INTEREST_LABEL[row.interest as PilotInterest] ?? row.interest}
                        </span>{" "}
                        — {new Date(row.created_at).toLocaleDateString()} · {row.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {!user ? (
              <div className="editorial-card p-6 md:p-8">
                <p className="kicker text-primary">Account required</p>
                <h3 className="mt-2 font-display text-3xl font-black">MAKE THE SIGN-UP ATTRIBUTABLE.</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Sign in first. Pilot sign-up records the current Terms and Privacy acceptance to your account, not just this device.
                </p>
                <Link to="/auth" search={{ redirect: "/pilot" }} className="button-primary mt-6 inline-flex">
                  Sign in or create an account
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="editorial-card grid gap-5 p-6 md:p-8">
                <Field label="Full name"><input className="field-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" /></Field>
                <Field label="Email"><input type="email" className="field-control" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></Field>
                <Field label="ZIP code"><input className="field-control" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} inputMode="numeric" placeholder="77550" autoComplete="postal-code" /></Field>
                <Field label="I'm signing up as">
                  <select className="field-control" value={interest} onChange={(e) => setInterest(e.target.value as PilotInterest)}>
                    {INTERESTS.map((key) => <option key={key} value={key}>{PILOT_INTEREST_LABEL[key]}</option>)}
                  </select>
                </Field>
                <Field label="Anything we should know (optional)"><textarea className="field-control min-h-28" value={note} onChange={(e) => setNote(e.target.value)} /></Field>

                {legal.gate}

                <button type="submit" className="button-primary justify-center py-4" disabled={busy || !legal.satisfied}>
                  {busy ? "Submitting…" : "Join the pilot list"}
                </button>
                <p className="text-xs leading-5 text-muted-foreground">
                  Exact versions:{" "}
                  <Link to="/legal/terms" className="underline underline-offset-4">Terms of Service v1.0</Link>{" "}
                  and <Link to="/legal/privacy" className="underline underline-offset-4">Privacy Policy v1.0</Link>.
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-foreground text-background">
          <div className="site-shell grid gap-6 py-12 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Questions or corrections</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b8b2a7]">
                Pilot questions, listing corrections and removal requests go directly to the monitored support address.
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
