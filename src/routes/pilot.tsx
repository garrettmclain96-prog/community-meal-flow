import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
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
  "Nights, weekends and rural west-county coverage will be thin at launch.",
  "Payments run in test mode until the operating legal entity and live payout onboarding are published.",
  "Most directory listings are unclaimed local programs and are never fundable.",
  "Impact numbers only appear after an order actually closes — nothing is projected.",
];

const INTERESTS = Object.keys(PILOT_INTEREST_LABEL) as PilotInterest[];

function PilotPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const legal = useLegalGate({
    documents: BASE_DOCS,
    context: "pilot_signup",
    intro: "Signing up for the pilot requires accepting these two documents at their current version.",
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
      await submitPilotSignup({
        userId: user.id,
        fullName,
        email,
        postalCode,
        interest,
        note,
      });
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
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="site-shell py-14 md:py-20">
          <p className="kicker text-primary">Public pilot</p>
          <h1 className="display-title mt-5 max-w-5xl text-5xl md:text-7xl">
            GALVESTON COUNTY GOES LIVE {PILOT_LIVE_DATE.toUpperCase()}.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            On {PILOT_LIVE_DATE} the full loop opens to the public in Galveston County: private
            household requests, verified partner routing, paid local kitchen capacity, volunteer
            dispatch and a public aggregate ledger. This page is where you get in line — as a
            household, a kitchen, a volunteer, a partner or a sponsor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#signup" className="button-primary">
              Sign up for the pilot
            </a>
            <Link to="/trust-method" className="button-secondary">
              How this works
            </Link>
          </div>
        </section>

        <section className="section-rule bg-secondary text-secondary-foreground">
          <div className="site-shell py-16">
            <p className="kicker">Eligibility</p>
            <h2 className="display-title mt-4 max-w-4xl text-4xl md:text-6xl">
              WHO CAN TAKE PART.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {ELIGIBILITY.map((item) => (
                <p key={item} className="editorial-card p-5 text-sm leading-6 text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell py-16">
          <p className="kicker text-primary">Known limits at launch</p>
          <h2 className="mt-4 font-display text-3xl font-black">What we are not promising.</h2>
          <ul className="mt-5 grid max-w-3xl gap-3 text-sm leading-6 text-muted-foreground">
            {LIMITS.map((l) => (
              <li key={l} className="border-l-2 border-border-strong pl-4">
                {l}
              </li>
            ))}
          </ul>
        </section>

        <section id="signup" className="section-rule bg-card">
          <div className="site-shell py-16">
            <p className="kicker text-primary">Sign up</p>
            <h2 className="display-title mt-4 text-4xl md:text-5xl">GET ON THE PILOT LIST.</h2>

            {!user ? (
              <div className="editorial-card mt-8 max-w-2xl p-6">
                <p className="text-sm leading-6 text-muted-foreground">
                  Sign in first. Pilot sign-up records your acceptance of the Terms and Privacy
                  Policy to your account, so it has to be attributable to a real login rather than a
                  device.
                </p>
                <Link to="/auth" className="button-primary mt-5 inline-flex">
                  Sign in or create an account
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="editorial-card mt-8 grid max-w-2xl gap-4 p-6">
                <label className="grid gap-1 text-sm">
                  <span className="kicker">Full name</span>
                  <input
                    className="input-field"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="kicker">Email</span>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="kicker">ZIP code</span>
                  <input
                    className="input-field"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    inputMode="numeric"
                    placeholder="77550"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="kicker">I'm signing up as</span>
                  <select
                    className="input-field"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value as PilotInterest)}
                  >
                    {INTERESTS.map((key) => (
                      <option key={key} value={key}>
                        {PILOT_INTEREST_LABEL[key]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="kicker">Anything we should know (optional)</span>
                  <textarea
                    className="input-field min-h-24"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>

                {legal.gate}

                <button
                  type="submit"
                  className="button-primary justify-center py-4"
                  disabled={busy || !legal.satisfied}
                >
                  {busy ? "Submitting…" : "Join the pilot list"}
                </button>
                <p className="text-xs text-muted-foreground">
                  Read the exact versions you're accepting:{" "}
                  <Link to="/legal/terms" className="underline underline-offset-4">
                    Terms of Service v1.0
                  </Link>{" "}
                  and{" "}
                  <Link to="/legal/privacy" className="underline underline-offset-4">
                    Privacy Policy v1.0
                  </Link>
                  .
                </p>
              </form>
            )}

            {mine.data && mine.data.length > 0 && (
              <div className="mt-8 max-w-2xl">
                <p className="kicker text-primary">Your sign-ups</p>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  {mine.data.map((row) => (
                    <li key={row.id} className="editorial-card p-4">
                      <span className="font-semibold text-foreground">
                        {PILOT_INTEREST_LABEL[row.interest as PilotInterest] ?? row.interest}
                      </span>{" "}
                      — {new Date(row.created_at).toLocaleDateString()} · status {row.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
              Questions about the pilot, or need a listing corrected or removed? Email{" "}
              <a href={SUPPORT_MAILTO} className="underline underline-offset-4">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
