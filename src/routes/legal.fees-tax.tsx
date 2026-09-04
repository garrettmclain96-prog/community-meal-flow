import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalDocPage, legalHead, type LegalSection } from "@/components/LegalDocPage";

export const Route = createFileRoute("/legal/fees-tax")({
  head: legalHead(
    "fees_tax",
    "ProvisionLoop Fees & Tax Treatment v1.0: current pilot platform fee is $0, how the displayed meal amount is calculated, and why payments are not represented as tax-deductible donations.",
  ),
  component: FeesTaxPage,
});

const SECTIONS: LegalSection[] = [
  {
    id: "platform-fee",
    heading: "Current pilot platform fee: $0",
    body: (
      <>
        <p className="legal-callout">
          ProvisionLoop currently adds <strong>no platform fee</strong> to any payment. The checkout
          charges the kitchen&apos;s posted cost per meal multiplied by the number of meals, and
          nothing else. There is no percentage cut and no per-transaction surcharge in the code that
          creates a checkout.
        </p>
        <p>
          A platform fee is a configurable part of a future version of this document. If one is ever
          introduced it will be disclosed in advance as a new version of this page, shown in
          checkout before you pay, and will never be applied retroactively to a payment already
          made.
        </p>
      </>
    ),
  },
  {
    id: "meal-amount",
    heading: "How the displayed amount is calculated",
    body: (
      <>
        <p>Exactly as the application computes it:</p>
        <ul>
          <li>
            The operator sets a <strong>cost per meal</strong> for the kitchen, and optionally a
            different cost per meal for a specific meal template.
          </li>
          <li>
            That figure is read <strong>on the server</strong> from the kitchen or template record —
            never from your browser — so a client cannot choose its own price.
          </li>
          <li>
            The charge is <code>cost per meal × number of meals</code>. The per-meal unit price must
            be at least US$0.50 for the processor to accept it.
          </li>
          <li>
            Sales tax is calculated automatically by the payment processor where it applies. If the
            account has no tax origin address configured, checkout proceeds untaxed.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "processor-costs",
    heading: "Payment processing costs",
    body: (
      <>
        <p>
          Payment processing is performed by Stripe, which charges its own fees to the ProvisionLoop
          account under Stripe&apos;s published pricing. Those fees are set by Stripe, not by
          ProvisionLoop, and this page does not restate a percentage we do not control.
        </p>
        <p>
          What the code does today, precisely: the payout recorded for a delivered order equals the{" "}
          <strong>full amount charged for that order</strong>, and that full amount is transferred
          to the kitchen&apos;s connected payout account.{" "}
          <strong>Processing costs are not deducted from the kitchen&apos;s payout</strong> — they
          are absorbed by the ProvisionLoop account. If that ever changes, it changes here first, as
          a new version.
        </p>
      </>
    ),
  },
  {
    id: "kitchen-payouts",
    heading: "Kitchen payouts",
    body: (
      <ul>
        <li>
          A payout is queued only when an order is marked <strong>delivered</strong>, and only for a
          kitchen whose operator has claimed the listing and completed payout onboarding.
        </li>
        <li>
          Payouts are sent to the operator&apos;s connected account with the payment processor.
        </li>
        <li>
          Operators are independent businesses responsible for their own taxes and their own tax
          reporting. See the{" "}
          <Link to="/legal/kitchen-agreement">Kitchen Participation Agreement</Link>.
        </li>
      </ul>
    ),
  },
  {
    id: "tax-treatment",
    heading: "Tax treatment — read this before you assume a deduction",
    body: (
      <>
        <p className="legal-callout">
          ProvisionLoop makes <strong>no claim</strong> that any payment made through the platform
          is a charitable contribution or is tax-deductible. ProvisionLoop does not represent itself
          as a nonprofit, a tax-exempt organization, a fiscal sponsor or a tax adviser.
        </p>
        <p>
          Under IRS Publication 526, a charitable contribution deduction is generally available only
          for a gift to a qualified organization, under an applicable arrangement, and reduced by
          the value of anything you receive in return. A payment to a for-profit local kitchen for
          meal production, coordinated through a platform, does not by itself meet that standard.
        </p>
        <p>
          Receipts and confirmations issued through the platform are{" "}
          <strong>payment records</strong>. They are not charitable contribution acknowledgments and
          they contain no statement of deductibility, because none is warranted.
        </p>
        <p>
          Your own situation may differ — for example if a qualified organization is directly
          involved in your arrangement. Consult your own tax adviser. Nothing on this page is tax
          advice.
        </p>
      </>
    ),
  },
  {
    id: "receipts",
    heading: "Receipts and records",
    body: (
      <p>
        The payment processor issues the payment receipt. Your funding history and its identifiers
        stay visible in your account. Use one of those identifiers — never a card number — when you
        contact us through the <Link to="/refund-request">refund and cancellation form</Link>.
      </p>
    ),
  },
  {
    id: "pilot",
    heading: "Pilot status",
    body: (
      <p>
        Live payments are disabled. Checkout runs in the payment processor&apos;s test environment
        until the operating legal entity and a monitored legal contact channel are published in the{" "}
        <Link to="/legal">Legal Center</Link>. No real money is captured before then.
      </p>
    ),
  },
];

function FeesTaxPage() {
  return (
    <LegalDocPage
      docKey="fees_tax"
      intro={
        <p className="text-sm">
          Current pilot platform fee: <strong>$0</strong>. You pay the operator&apos;s posted cost
          per meal times the number of meals, calculated on the server. Payments are not represented
          as charitable contributions and are not represented as tax-deductible.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
