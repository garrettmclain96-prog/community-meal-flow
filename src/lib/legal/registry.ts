/**
 * Central legal document registry.
 *
 * Bumping a version here is what triggers intentional re-consent: acceptance
 * rows are stored per (document_key, document_version), so any surface that
 * checks `hasAccepted(key)` will ask again once the version changes.
 */

export const LEGAL_EFFECTIVE_DATE = "September 4, 2026";
export const LEGAL_LAST_UPDATED = "September 4, 2026";

export type LegalDocKey =
  | "terms"
  | "privacy"
  | "refunds"
  | "fees_tax"
  | "kitchen_agreement"
  | "partner_data"
  | "volunteer_waiver";

export type LegalDoc = {
  key: LegalDocKey;
  version: string;
  title: string;
  shortTitle: string;
  path: string;
  summary: string;
  /** Agreements that carry a personal undertaking capture a typed signer name. */
  requiresSignature: boolean;
};

export const LEGAL_DOCUMENTS: Record<LegalDocKey, LegalDoc> = {
  terms: {
    key: "terms",
    version: "1.0",
    title: "Terms of Service",
    shortTitle: "Terms",
    path: "/legal/terms",
    summary:
      "The platform rules for the Texas pilot: you must be 18+, ProvisionLoop is not an emergency service, assistance is never guaranteed, and many mapped providers are unaffiliated directory listings.",
    requiresSignature: false,
  },
  privacy: {
    key: "privacy",
    version: "1.0",
    title: "Privacy Policy",
    shortTitle: "Privacy",
    path: "/legal/privacy",
    summary:
      "What we collect, why, who processes it, and how to exercise your Texas privacy rights. We do not sell personal data, run targeted advertising, or profile you for advertising.",
    requiresSignature: false,
  },
  refunds: {
    key: "refunds",
    version: "1.0",
    title: "Refund & Cancellation Policy",
    shortTitle: "Refunds",
    path: "/legal/refunds",
    summary:
      "One-time funding can be cancelled before a kitchen accepts the order. After acceptance it is normally non-refundable because food cost and labor begin. Subscriptions stop before the next renewal.",
    requiresSignature: false,
  },
  fees_tax: {
    key: "fees_tax",
    version: "1.0",
    title: "Fees & Tax Treatment",
    shortTitle: "Fees & tax",
    path: "/legal/fees-tax",
    summary:
      "Current pilot platform fee: $0. Payments are not represented as charitable contributions and are not represented as tax-deductible. Receipts are payment records, not charitable acknowledgments.",
    requiresSignature: false,
  },
  kitchen_agreement: {
    key: "kitchen_agreement",
    version: "1.0",
    title: "Kitchen Participation Agreement",
    shortTitle: "Kitchen agreement",
    path: "/legal/kitchen-agreement",
    summary:
      "For operators who claim or register a kitchen: you are an independent business, you set truthful prices and capacity, you hold your own permits and food-safety practices, and you never reuse recipient data.",
    requiresSignature: true,
  },
  partner_data: {
    key: "partner_data",
    version: "1.0",
    title: "Partner Data-Handling Agreement",
    shortTitle: "Partner data",
    path: "/legal/partner-data",
    summary:
      "For community partner organizations that see identifiable assistance requests: minimum-necessary use, role-based access, no sponsor access, no independent outreach, prompt incident notice.",
    requiresSignature: true,
  },
  volunteer_waiver: {
    key: "volunteer_waiver",
    version: "1.0",
    title: "Volunteer Assumption of Risk, Release & Waiver",
    shortTitle: "Volunteer waiver",
    path: "/legal/volunteer-waiver",
    summary:
      "Adults 18+ only for the pilot. You assume the inherent risks of food work, lifting and delivery, and you release ProvisionLoop's ordinary negligence — never gross negligence, reckless or willful misconduct, or non-waivable rights.",
    requiresSignature: true,
  },
};

export const LEGAL_ORDER: LegalDocKey[] = [
  "terms",
  "privacy",
  "refunds",
  "fees_tax",
  "kitchen_agreement",
  "partner_data",
  "volunteer_waiver",
];

/** Documents everyone using an account must accept. */
export const BASE_DOCS: LegalDocKey[] = ["terms", "privacy"];

/** Documents required for a payment action. */
export const PAYMENT_DOCS: LegalDocKey[] = ["refunds", "fees_tax"];

export function legalDoc(key: LegalDocKey): LegalDoc {
  return LEGAL_DOCUMENTS[key];
}

export function legalLabel(key: LegalDocKey): string {
  const doc = LEGAL_DOCUMENTS[key];
  return `${doc.title} v${doc.version}`;
}
