import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalDocPage, legalHead, type LegalSection } from "@/components/LegalDocPage";

export const Route = createFileRoute("/legal/kitchen-agreement")({
  head: legalHead(
    "kitchen_agreement",
    "ProvisionLoop Kitchen Participation Agreement v1.0: independent business status, authority to claim a listing, permits and food safety, truthful pricing and capacity, payouts, refunds and termination.",
  ),
  component: KitchenAgreementPage,
});

const SECTIONS: LegalSection[] = [
  {
    id: "parties",
    heading: "Who this covers",
    body: (
      <p>
        This agreement applies to you personally and to the business you represent when you register
        a kitchen or claim an existing directory listing on ProvisionLoop. It sits on top of the{" "}
        <Link to="/legal/terms">Terms of Service</Link> and{" "}
        <Link to="/legal/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: "independent",
    heading: "Independent business — no agency, no partnership",
    body: (
      <p className="legal-callout">
        You operate an independent business. Nothing here creates an employment relationship,
        agency, joint venture, franchise or partnership between you and ProvisionLoop. Neither side
        may bind the other or hold itself out as authorized to act for the other. You control your
        own staff, premises, hours, methods and menu.
      </p>
    ),
  },
  {
    id: "authority",
    heading: "Authority to claim",
    body: (
      <>
        <p>
          By claiming a listing you represent that you own or operate that organization, or are
          authorized by it to control its listing, pricing, capacity and payouts.
        </p>
        <p>
          Claiming a listing you have no authority over is a serious breach: we will remove the
          claim, may suspend the account, and may notify the organization. Unclaimed listings
          receive no money and cannot be selected for funding.
        </p>
      </>
    ),
  },
  {
    id: "compliance",
    heading: "Licences, permits and food safety",
    body: (
      <>
        <p>You are solely responsible for:</p>
        <ul>
          <li>
            Holding and maintaining every licence, permit, registration and inspection your
            jurisdiction requires for the food you produce and serve.
          </li>
          <li>
            Complying with applicable food safety law and health-department rules, including
            temperature control, hygiene, storage and transport handling.
          </li>
          <li>
            Truthful allergen practice: describing major allergens in the meals you post, and
            telling recipients where cross-contact cannot be excluded.
          </li>
          <li>Meeting any dietary or religious claim you choose to make about a meal.</li>
        </ul>
        <p>
          ProvisionLoop does not inspect kitchens, does not certify food safety, and does not verify
          permits. Claiming a listing is not a certification by ProvisionLoop.
        </p>
      </>
    ),
  },
  {
    id: "listing-accuracy",
    heading: "Truthful price, capacity and menu",
    body: (
      <ul>
        <li>
          You set your own cost per meal. It must reflect what you genuinely need to produce the
          meal. ProvisionLoop does not set or mark up your price.
        </li>
        <li>
          You set your own daily capacity. Posted capacity must be capacity you can actually
          deliver.
        </li>
        <li>
          Menu templates, descriptions and photographs must be accurate and must be yours to use.
        </li>
        <li>
          Keep all of it current, and take a listing inactive rather than leaving it misleading.
        </li>
      </ul>
    ),
  },
  {
    id: "orders",
    heading: "Accepting and fulfilling orders",
    body: (
      <>
        <ul>
          <li>
            You decide whether to accept an order. Once you accept, you commit to producing the
            meals as described and on the agreed timing.
          </li>
          <li>
            You advance the order honestly through its stages, and mark it delivered only when the
            meals genuinely left your control for the recipient or a dispatched run.
          </li>
          <li>
            Package food safely and appropriately for holding and transport, labelled where
            labelling is required.
          </li>
          <li>
            Tell us as soon as you know you cannot fulfill an accepted order, so the sponsor can be
            refunded or redirected.
          </li>
        </ul>
        <p className="legal-callout">
          Falsely marking meals delivered is fraud against sponsors and against the public ledger.
          It ends participation immediately and may be reported.
        </p>
      </>
    ),
  },
  {
    id: "records",
    heading: "Records",
    body: (
      <p>
        Keep reasonable records of meals produced and fulfilled under this agreement for at least
        two years, and make them available to ProvisionLoop on reasonable request where a sponsor
        dispute, a refund, a payout question or a suspected misstatement requires verification.
      </p>
    ),
  },
  {
    id: "recipient-data",
    heading: "Recipient information",
    body: (
      <>
        <p>
          You receive the minimum needed to cook and hand off: quantities, timing, dietary
          constraints and a drop point. You do not receive recipient identity from ProvisionLoop.
        </p>
        <p>
          Anything you do learn about a recipient may be used only to fulfill that order. It may not
          be used for marketing, fundraising, recruitment, resale, publication or any independent
          outreach, and it must not be disclosed except as the law requires.
        </p>
      </>
    ),
  },
  {
    id: "payouts",
    heading: "Payouts",
    body: (
      <ul>
        <li>
          Payouts require onboarding with our payment processor as a connected account. Until payout
          onboarding is complete your listing cannot be funded.
        </li>
        <li>
          A payout is queued when an order is marked delivered, and sent to your connected account.
        </li>
        <li>
          The payout equals the full amount charged for that order. ProvisionLoop currently deducts
          no platform fee. See <Link to="/legal/fees-tax">Fees &amp; Tax Treatment</Link>.
        </li>
        <li>
          Payout timing depends on the processor and your bank. We may hold a payout while a
          dispute, suspected fraud or a fulfillment question is open.
        </li>
      </ul>
    ),
  },
  {
    id: "refunds",
    heading: "Refunds and failed fulfillment",
    body: (
      <p>
        If an accepted order is not fulfilled, in whole or in part, the sponsor is refunded or
        redirected for the unfulfilled portion under the{" "}
        <Link to="/legal/refunds">Refund &amp; Cancellation Policy</Link>. Where a payout has
        already been sent for meals that were not produced, you agree to return that amount or to
        have it set off against future payouts.
      </p>
    ),
  },
  {
    id: "taxes",
    heading: "Taxes",
    body: (
      <p>
        Amounts you receive are business revenue. You are responsible for your own income, sales,
        employment and other taxes, and for your own tax reporting and any information returns the
        payment processor is required to issue to you. ProvisionLoop is not your tax adviser.
      </p>
    ),
  },
  {
    id: "insurance",
    heading: "Insurance",
    body: (
      <p>
        ProvisionLoop does not currently require you to carry a specific insurance policy, and does
        not verify insurance. We strongly recommend that you maintain general liability and product
        liability coverage appropriate to food service, and any coverage your jurisdiction, landlord
        or permit requires. A future version of this agreement may make specific coverage mandatory;
        that change would be published in advance as a new version.
      </p>
    ),
  },
  {
    id: "brand",
    heading: "Name, logo and content",
    body: (
      <>
        <p>
          You grant ProvisionLoop a limited, non-exclusive, royalty-free licence to display your
          claimed business name, logo, menu descriptions and photographs to operate the platform —
          listing you, showing your meals, and attributing fulfilled orders. This licence ends when
          you leave, except for aggregate historical records with no logo or photograph.
        </p>
        <p>
          ProvisionLoop will not state or imply that you endorse ProvisionLoop beyond your actual
          participation, and will not describe you as a partner, sponsor or certified provider
          unless you have agreed to that description.
        </p>
      </>
    ),
  },
  {
    id: "corrections",
    heading: "Corrections and removal",
    body: (
      <p>
        You can correct your listing directly in the <Link to="/kitchen">kitchen workspace</Link>,
        or set it inactive to stop appearing. If you want an unclaimed directory listing corrected
        or removed, use the claim flow to establish authority first. A monitored contact channel
        will be published in the <Link to="/legal">Legal Center</Link> before the public pilot
        opens.
      </p>
    ),
  },
  {
    id: "suspension",
    heading: "Suspension",
    body: (
      <p>
        ProvisionLoop may suspend or remove a kitchen, immediately where necessary, for unauthorized
        claiming, false fulfillment records, food safety risk, misrepresented price or capacity,
        misuse of recipient information, or a legal requirement. Where practicable we will tell you
        why and give you a chance to respond.
      </p>
    ),
  },
  {
    id: "indemnity",
    heading: "Indemnity",
    body: (
      <p className="legal-callout">
        You will indemnify ProvisionLoop against third-party claims arising from your food, your
        premises, your staff, your permits or licences, your breach of this agreement, or your
        unlawful, reckless or intentional conduct. This indemnity does <strong>not</strong> extend
        to claims caused by ProvisionLoop&apos;s own negligence, gross negligence, reckless or
        willful misconduct, and it is limited to the extent Texas law allows indemnification of
        these matters.
      </p>
    ),
  },
  {
    id: "confidentiality",
    heading: "Confidentiality",
    body: (
      <p>
        Each side will keep the other&apos;s non-public operational information confidential and use
        it only for this participation, except where disclosure is legally required. Recipient and
        assistance information is always confidential.
      </p>
    ),
  },
  {
    id: "term",
    heading: "Term, termination and governing law",
    body: (
      <p>
        This agreement runs from the moment you accept it until either side ends it. You may end it
        at any time by deactivating your kitchen; accepted orders must still be fulfilled or
        cancelled so sponsors can be refunded. Confidentiality, recipient data restrictions,
        indemnity, records and payout set-off survive. Texas law governs, consistent with the{" "}
        <Link to="/legal/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

function KitchenAgreementPage() {
  return (
    <LegalDocPage
      docKey="kitchen_agreement"
      intro={
        <p className="text-sm">
          You run an independent business. You hold the permits, you set the price and capacity
          honestly, you fulfill what you accept, you never reuse recipient information, and you get
          paid the full charged amount when an order is delivered.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
