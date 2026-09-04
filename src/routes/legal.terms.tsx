import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalDocPage, legalHead, type LegalSection } from "@/components/LegalDocPage";

export const Route = createFileRoute("/legal/terms")({
  head: legalHead(
    "terms",
    "ProvisionLoop Terms of Service v1.0 for the Texas pilot: eligibility, role responsibilities, acceptable use, no emergency service, disclaimers, limitation of liability and governing law.",
  ),
  component: TermsPage,
});

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "What ProvisionLoop is",
    body: (
      <>
        <p>
          ProvisionLoop is a coordination platform for local food assistance. It lets households
          make private assistance requests, lets community partner organizations route those
          requests, lets local kitchen operators accept and fulfill paid meal orders, lets
          volunteers sign up for prep shifts and delivery runs, and publishes aggregate results to a
          public ledger.
        </p>
        <p>
          ProvisionLoop is not a food provider, not a kitchen, not a charity, not a delivery company
          and not a government program. It coordinates between the people and organizations who do
          that work.
        </p>
        <p>
          These Terms are platform terms for a Texas pilot. They are not legal, financial or tax
          advice to you.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    heading: "Eligibility and accounts",
    body: (
      <>
        <ul>
          <li>
            You must be at least <strong>18 years old</strong> to create an account or use any
            account-based feature. The pilot has no guardian or minor flow.
          </li>
          <li>
            You must give accurate information and keep it accurate. You are responsible for
            everything done through your account.
          </li>
          <li>
            Keep your credentials secret. Tell us as soon as you believe your account has been used
            without your permission, using the request channels in the{" "}
            <Link to="/privacy-center">Privacy Center</Link>.
          </li>
          <li>
            We may refuse, suspend or remove an account when these Terms are broken, when a listing
            is claimed without authority, or when someone is put at risk.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "roles",
    heading: "Role responsibilities",
    body: (
      <>
        <p>An account can hold one or more roles. Each carries its own obligations.</p>
        <ul>
          <li>
            <strong>Household.</strong> Ask for help honestly. Assistance requests are routed to
            partner organizations who apply their own eligibility rules.
          </li>
          <li>
            <strong>Sponsor.</strong> Funding a kitchen is a payment for meal production capacity,
            not a charitable contribution. See{" "}
            <Link to="/legal/fees-tax">Fees &amp; Tax Treatment</Link>.
          </li>
          <li>
            <strong>Kitchen operator.</strong> Governed additionally by the{" "}
            <Link to="/legal/kitchen-agreement">Kitchen Participation Agreement</Link>.
          </li>
          <li>
            <strong>Community partner.</strong> Governed additionally by the{" "}
            <Link to="/legal/partner-data">Partner Data-Handling Agreement</Link>.
          </li>
          <li>
            <strong>Volunteer.</strong> Governed additionally by the{" "}
            <Link to="/legal/volunteer-waiver">
              Volunteer Assumption of Risk, Release &amp; Waiver
            </Link>
            .
          </li>
          <li>
            <strong>City / public sector.</strong> Sees aggregate figures only. No recipient
            identity is available through any civic view.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "no-emergency",
    heading: "Not an emergency service",
    body: (
      <>
        <p className="legal-callout">
          ProvisionLoop is not an emergency, crisis, medical or safety service. Do not use it to
          report an emergency. If someone is in danger or needs urgent medical help, call 911 or
          your local emergency number. For food, housing and benefit navigation in Texas you can
          also dial 2-1-1.
        </p>
        <p>
          Requests are reviewed by people during ordinary working hours. There is no guaranteed
          response time and no monitoring of the platform around the clock.
        </p>
      </>
    ),
  },
  {
    id: "no-guarantee",
    heading: "No guarantee of assistance, availability or outcome",
    body: (
      <>
        <ul>
          <li>
            Submitting a request does not create an entitlement to food, a meal, a delivery or any
            other benefit. Partner organizations decide independently.
          </li>
          <li>
            Kitchen capacity, volunteer availability and funding all fluctuate. Any capacity, cost
            or timing shown in the app is what an operator entered and may change or be withdrawn.
          </li>
          <li>
            The platform may be unavailable, interrupted or changed at any time. It is provided
            during the pilot without any service-level commitment.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "directory",
    heading: "Directory listings may be unaffiliated",
    body: (
      <>
        <p>
          Many food programs shown in ProvisionLoop are <strong>directory listings</strong> compiled
          from public information so people can find help. A directory listing means the
          organization has <em>not</em> partnered with, endorsed, joined or been vetted by
          ProvisionLoop, receives no money through the platform, and cannot be selected for funding.
        </p>
        <p>
          Only a listing whose operator has claimed it <em>and</em> completed payout onboarding can
          receive funding. This is enforced on the server for every one-time and recurring payment
          path. Details are on <Link to="/trust-method">Trust &amp; method</Link>.
        </p>
        <p>
          If you operate a listed organization and want the listing corrected or removed, use the
          kitchen claim flow on the <Link to="/kitchen">kitchen page</Link>. A monitored contact
          channel will be published in this Legal Center before the public pilot opens.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            Claim a listing you have no authority to control, or misrepresent an organization.
          </li>
          <li>
            Use assistance, referral or recipient information for marketing, fundraising, political,
            religious-recruitment, resale or research purposes.
          </li>
          <li>Attempt to identify a recipient from aggregate or de-identified figures.</li>
          <li>
            Post false capacity, false prices, false fulfillment records or false impact claims.
          </li>
          <li>
            Scrape, probe, overload, reverse engineer, or bypass access controls, rate limits or the
            funding safety gate.
          </li>
          <li>Harass, endanger, discriminate against or exploit anyone in the network.</li>
          <li>Upload malware, or content that is unlawful, infringing or deceptive.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    heading: "Payments",
    body: (
      <>
        <p>
          Payment terms are part of these Terms by reference:{" "}
          <Link to="/legal/refunds">Refund &amp; Cancellation Policy</Link> and{" "}
          <Link to="/legal/fees-tax">Fees &amp; Tax Treatment</Link>.
        </p>
        <p>
          Payments are processed by Stripe. ProvisionLoop never receives or stores your full card
          number. Live payments are disabled during the pilot; checkout runs in the processor&apos;s
          test environment until the launch gate in section 14 is met.
        </p>
      </>
    ),
  },
  {
    id: "content",
    heading: "Intellectual property and your content",
    body: (
      <>
        <p>
          ProvisionLoop owns the platform, its software, design and its own text. You keep ownership
          of what you submit — listings, menus, photos, recipes, notes.
        </p>
        <p>
          By submitting content you grant ProvisionLoop a non-exclusive, worldwide, royalty-free
          licence to host, store, reproduce and display that content only to operate the platform
          and the features you used it for. This licence ends when you delete the content, except
          for copies kept in backups until they expire or where the law requires retention.
        </p>
        <p>
          Do not submit content you have no right to submit. Notify us of an infringement claim
          through the request channels in the <Link to="/privacy-center">Privacy Center</Link>.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    heading: "Third parties",
    body: (
      <p>
        Kitchens, partner organizations, volunteers and payment, hosting and infrastructure
        providers are independent of ProvisionLoop. ProvisionLoop does not control the food they
        prepare, the eligibility decisions they make, the vehicles they drive or the services they
        run, and does not employ them or act as their agent.
      </p>
    ),
  },
  {
    id: "suspension",
    heading: "Suspension and termination",
    body: (
      <>
        <p>
          You can stop using ProvisionLoop and request deletion of your account at any time through
          the <Link to="/privacy-center">Privacy Center</Link>.
        </p>
        <p>
          We may suspend or end access — immediately where there is risk of harm, fraud,
          unauthorized claiming or a legal requirement, and otherwise with notice where practicable.
          Sections that by their nature survive (content licence for retained copies, disclaimers,
          limitation of liability, governing law) survive termination.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    heading: "Disclaimers",
    body: (
      <>
        <p className="legal-callout">
          THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;. TO THE EXTENT
          PERMITTED BY LAW, PROVISIONLOOP DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that assistance will be provided, that food will meet any particular
          dietary, allergen or religious requirement, that listings are current or accurate, or that
          the service will be uninterrupted or error-free. Food safety, allergen handling and
          permitting are the responsibility of the kitchen that prepares the food.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: (
      <>
        <p>
          To the fullest extent permitted by Texas law, ProvisionLoop is not liable for indirect,
          incidental, special, consequential, exemplary or punitive damages, or for lost profits,
          lost data or lost goodwill.
        </p>
        <p>
          Where liability cannot be excluded, ProvisionLoop&apos;s total aggregate liability arising
          out of or relating to the platform is limited to the greater of (a) the amount you paid
          through the platform in the twelve months before the event giving rise to the claim, or
          (b) one hundred U.S. dollars (US$100).
        </p>
        <p className="legal-callout">
          Nothing in these Terms limits or excludes liability that cannot lawfully be limited or
          excluded, including liability for gross negligence, for reckless, intentional or willful
          misconduct, for fraud or fraudulent misrepresentation, or for death or personal injury to
          the extent Texas law prohibits its exclusion. ProvisionLoop claims no immunity.
        </p>
      </>
    ),
  },
  {
    id: "law",
    heading: "Governing law and disputes",
    body: (
      <>
        <p>
          These Terms are governed by the laws of the State of Texas, without regard to conflict of
          laws rules. Disputes will be brought in the state or federal courts located in Texas, and
          both sides consent to that jurisdiction. Nothing here prevents either side from seeking
          relief in small claims court or from a regulator.
        </p>
        <p>
          There is no mandatory arbitration clause and no class-action waiver in version 1.0. If a
          future version introduces one, it will be published as a new version with advance notice
          and re-consent.
        </p>
      </>
    ),
  },
  {
    id: "electronic",
    heading: "Electronic records, communications and signatures",
    body: (
      <>
        <p>
          You agree to receive notices, agreements and disclosures electronically. Under the Texas
          Uniform Electronic Transactions Act (Texas Business &amp; Commerce Code Chapter 322), an
          electronic record or signature has the same effect as one on paper.
        </p>
        <p>
          When you accept a document, we record the document key, its version, your account ID, the
          time, the role or context in which you accepted, and — for agreements that call for a
          signature — the name you typed. We do <strong>not</strong> record your IP address or a
          device fingerprint for this purpose. You can withdraw consent to electronic records by
          closing your account.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes, versioning and the launch gate",
    body: (
      <>
        <p>
          Every document in the <Link to="/legal">Legal Center</Link> carries a version and an
          effective date. Material changes get a new version number, and where a change materially
          affects your rights or obligations we will ask you to accept the new version before you
          continue with the affected action.
        </p>
        <p className="legal-callout">
          <strong>Launch gate.</strong> Before ProvisionLoop accepts live money, the operating legal
          entity and a monitored legal contact channel must be published in the Legal Center. Until
          then, live payments remain disabled and checkout runs in the payment processor&apos;s test
          environment. We will not publish a placeholder entity, address or email address.
        </p>
      </>
    ),
  },
];

function TermsPage() {
  return (
    <LegalDocPage
      docKey="terms"
      intro={
        <p className="text-sm">
          These Terms govern your use of ProvisionLoop during its Texas pilot. Read section 4 (not
          an emergency service), section 6 (directory listings may be unaffiliated) and section 13
          (limitation of liability) closely — they change what you can expect from the platform.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
