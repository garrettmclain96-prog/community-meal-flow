import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalDocPage, legalHead, type LegalSection } from "@/components/LegalDocPage";

export const Route = createFileRoute("/legal/refunds")({
  head: legalHead(
    "refunds",
    "ProvisionLoop Refund & Cancellation Policy v1.0: cancel one-time funding before a kitchen accepts, subscription cancellation before renewal, duplicate and unauthorized charge review.",
  ),
  component: RefundsPage,
});

const SECTIONS: LegalSection[] = [
  {
    id: "what-you-pay-for",
    heading: "What you are paying for",
    body: (
      <>
        <p>
          When you fund meals you are paying a specific kitchen to produce a specific number of meals
          at that operator&apos;s own posted cost per meal. When you take a recurring sponsorship you
          are paying a fixed monthly amount that funds kitchens with the largest unmet demand at each
          renewal.
        </p>
        <p>
          Payments are not charitable contributions. See{" "}
          <Link to="/legal/fees-tax">Fees &amp; Tax Treatment</Link>.
        </p>
      </>
    ),
  },
  {
    id: "one-time",
    heading: "One-time meal funding",
    body: (
      <>
        <ul>
          <li>
            <strong>Before a kitchen accepts the order</strong> — you may cancel and receive a full
            refund. Nothing has been bought or cooked yet.
          </li>
          <li>
            <strong>After a kitchen accepts</strong> — the order is normally non-refundable, because
            ingredient purchasing, scheduling and labor begin at acceptance. We will still review
            individual circumstances.
          </li>
          <li>
            <strong>If ProvisionLoop or the kitchen cancels</strong>, or fulfillment becomes
            impossible for any reason, you receive a full refund of the unfulfilled portion, or — if
            you prefer and tell us — the amount is redirected to another funding-enabled kitchen.
          </li>
          <li>
            <strong>Partial fulfillment</strong> is refunded proportionally for the meals not
            produced.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "subscriptions",
    heading: "Recurring sponsorships",
    body: (
      <ul>
        <li>
          Cancel at any time. Cancellation takes effect before the next renewal, and there are no
          further charges after it.
        </li>
        <li>
          A billing period that has already completed is generally not prorated, because the meals it
          funded have already been commissioned. Exceptions are made where the law requires it or
          where a billing error occurred.
        </li>
        <li>
          Upgrades and downgrades take effect according to the payment processor&apos;s standard
          proration for the plan change.
        </li>
        <li>
          You can manage or cancel a sponsorship yourself from the billing portal on the{" "}
          <Link to="/impact">Fund meals page</Link>, or ask us using the request form below.
        </li>
      </ul>
    ),
  },
  {
    id: "errors",
    heading: "Duplicate, unauthorized and mistaken charges",
    body: (
      <>
        <p>
          Tell us about a duplicate charge, a charge you did not authorize or an amount entered in
          error, and we will review it and refund where the review supports it. Refunds go back to
          the original payment method — we cannot send a refund anywhere else.
        </p>
        <p className="legal-callout">
          Never send us a card number, CVC or bank account number. Give us only the payment or
          subscription identifier already shown in your account.
        </p>
      </>
    ),
  },
  {
    id: "timing",
    heading: "Timing",
    body: (
      <p>
        Once a refund is issued, how quickly it appears is controlled by Stripe and your bank or card
        issuer, not by ProvisionLoop. Card refunds commonly take five to ten business days to post
        after they are issued.
      </p>
    ),
  },
  {
    id: "chargebacks",
    heading: "Disputes and chargebacks",
    body: (
      <p>
        You always keep the right to dispute a charge with your bank or card issuer. ProvisionLoop
        does not retaliate for a chargeback — we will not close your account, block your role or
        remove your access because you disputed a charge. We may respond to the dispute with our
        transaction records, and we may pause new funding on an account while a dispute is open.
      </p>
    ),
  },
  {
    id: "how-to-request",
    heading: "How to request a refund or cancellation",
    body: (
      <>
        <ol>
          <li>Sign in to the account that made the payment.</li>
          <li>
            Open the <Link to="/refund-request">refund &amp; cancellation request form</Link>.
          </li>
          <li>
            Choose the request type, paste the payment or subscription identifier from your account,
            and describe what happened.
          </li>
          <li>Submit. Your request is stored privately and only you and our reviewers can see it.</li>
        </ol>
        <p className="legal-callout">
          <strong>Pilot limitation, stated honestly:</strong> submitting the form does not
          automatically issue a refund. There is no automated refund pipeline and no operational
          admin queue in the product yet — requests are marked{" "}
          <em>queued for manual review</em> and a person acts on them. Building that admin queue is a
          launch blocker before live money is accepted.
        </p>
      </>
    ),
  },
  {
    id: "test-mode",
    heading: "Test mode during the pilot",
    body: (
      <p>
        Live payments are currently disabled. Checkout runs in the payment processor&apos;s test
        environment, so no real money is captured and there is nothing to refund from a test
        transaction. This section will be removed when the launch gate in the{" "}
        <Link to="/legal/terms">Terms of Service</Link> is met.
      </p>
    ),
  },
];

function RefundsPage() {
  return (
    <LegalDocPage
      docKey="refunds"
      intro={
        <>
          <p className="text-sm">
            Cancel one-time funding any time before a kitchen accepts the order. After acceptance,
            food cost and labor have begun and the order is normally non-refundable. Subscriptions
            stop before the next renewal.
          </p>
          <Link to="/refund-request" className="button-primary mt-4 print:hidden">
            Request a refund or cancellation
          </Link>
        </>
      }
      sections={SECTIONS}
    />
  );
}
