import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalDocPage, legalHead, type LegalSection } from "@/components/LegalDocPage";

export const Route = createFileRoute("/legal/partner-data")({
  head: legalHead(
    "partner_data",
    "ProvisionLoop Partner Data-Handling Agreement v1.0: minimum-necessary use of assistance and referral data, role-based access, no sponsor access, incident notice and retention.",
  ),
  component: PartnerDataPage,
});

const SECTIONS: LegalSection[] = [
  {
    id: "roles",
    heading: "Each party's role",
    body: (
      <>
        <p>
          ProvisionLoop operates the platform and determines how assistance requests are stored and
          routed. Your organization independently decides eligibility, safeguarding and what
          assistance to provide, and is a controller of the request data it receives for those
          decisions.
        </p>
        <p>
          Where your organization uses ProvisionLoop simply to record what it did, ProvisionLoop
          processes that record on your instructions. Neither party acts as the other&apos;s agent.
        </p>
      </>
    ),
  },
  {
    id: "minimum",
    heading: "Minimum-necessary use",
    body: (
      <p className="legal-callout">
        You may use assistance and referral data <strong>only</strong> to evaluate, route, schedule,
        fulfill and verify the assistance for the specific request it belongs to. Any other use —
        new programs, research, evaluation studies, fundraising, marketing, membership drives,
        recruitment, political or religious outreach, resale or transfer — is prohibited without a
        separate, valid, informed permission from the person the data is about.
      </p>
    ),
  },
  {
    id: "confidential",
    heading: "Confidentiality of assistance data",
    body: (
      <>
        <p>
          Request details, contact information and free-text notes are confidential. Notes commonly
          contain sensitive information — health, disability, immigration, family or religious
          circumstances — because people describe their situation in their own words. Treat all of
          it as sensitive.
        </p>
        <p>
          Do not repost, screenshot, forward outside authorized personnel, publish or discuss
          identifiable request details, including in newsletters, grant reports, social media or
          public meetings.
        </p>
      </>
    ),
  },
  {
    id: "no-sponsor",
    heading: "No sponsor access",
    body: (
      <p>
        Sponsors, donors, cities and the public never receive identifiable request data — not from
        ProvisionLoop and not from you. Reporting to any of them must be aggregate or de-identified.
        Do not connect a named recipient to a named funder.
      </p>
    ),
  },
  {
    id: "access-control",
    heading: "Authorized personnel and role-based access",
    body: (
      <ul>
        <li>
          Only individuals who need request data to do their job may have access, under named
          individual accounts.
        </li>
        <li>No shared logins, shared inboxes as an access route, or shared passwords.</li>
        <li>
          Your personnel must be bound by confidentiality obligations at least as protective as this
          agreement.
        </li>
        <li>
          Remove access promptly — within two business days — when someone leaves the role or the
          organization.
        </li>
      </ul>
    ),
  },
  {
    id: "safeguards",
    heading: "Reasonable safeguards",
    body: (
      <p>
        Maintain administrative, technical and physical safeguards appropriate to the sensitivity of
        the data: device locking and encryption where available, strong unique credentials with
        multi-factor authentication where offered, secure disposal of printouts, and no storage of
        request data in unmanaged personal accounts, personal devices without protection, or
        consumer file-sharing services.
      </p>
    ),
  },
  {
    id: "incidents",
    heading: "Incident notice",
    body: (
      <p className="legal-callout">
        If you learn of a suspected or actual unauthorized access, disclosure, loss or misuse of
        assistance or referral data, notify ProvisionLoop{" "}
        <strong>without undue delay and, where practicable, within 24 hours</strong> of becoming
        aware. Include what happened, what data and how many people are affected, what you have
        done, and what you plan to do. Cooperate fully with investigation, containment and any
        legally required notification.
      </p>
    ),
  },
  {
    id: "requests",
    heading: "Data subject requests",
    body: (
      <p>
        If a person asks you to access, correct, delete or port their data, or appeals a decision,
        handle it under your own obligations and tell ProvisionLoop promptly where ProvisionLoop
        holds the data. Each party will give the other the information and assistance reasonably
        needed to respond within the legal deadline. Requests reaching ProvisionLoop come through
        the <Link to="/privacy-center">Privacy Center</Link>.
      </p>
    ),
  },
  {
    id: "retention",
    heading: "Retention and deletion",
    body: (
      <p>
        Keep request data only while it is needed for the assistance and for your own record-keeping
        or funder obligations, then delete or de-identify it. Do not maintain a parallel permanent
        database of ProvisionLoop request data. On termination, delete or de-identify identifiable
        request data received through ProvisionLoop, except what a law, regulator or funder
        specifically requires you to retain, and tell us what you are retaining and why.
      </p>
    ),
  },
  {
    id: "processors",
    heading: "Approved processors",
    body: (
      <p>
        You may use your own service providers (case management, email, storage) only where they are
        bound by written confidentiality and security obligations at least as protective as this
        agreement, and only where their processing is necessary for the assistance.
        ProvisionLoop&apos;s own processors are listed in the{" "}
        <Link to="/legal/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: "reporting",
    heading: "Aggregate and de-identified reporting",
    body: (
      <p>
        Both parties may publish aggregate or de-identified figures — meals, neighborhoods, time
        windows, coverage. Neither party may attempt to re-identify an individual from those
        figures, or publish an aggregate so small that it identifies someone in practice.
      </p>
    ),
  },
  {
    id: "legal-process",
    heading: "Legal process",
    body: (
      <p>
        If either party receives a subpoena, warrant or similar demand for assistance data, it will,
        where legally permitted, notify the other party promptly and disclose only what is legally
        required.
      </p>
    ),
  },
  {
    id: "audit",
    heading: "Audit and cooperation",
    body: (
      <p>
        On reasonable written notice and no more than once a year absent an incident, each party
        will answer reasonable written questions about its handling of assistance data under this
        agreement. This is a cooperation obligation, not a right to inspect unrelated systems or
        client files.
      </p>
    ),
  },
  {
    id: "no-hipaa",
    heading: "No HIPAA representation",
    body: (
      <p className="legal-callout">
        ProvisionLoop does not represent that it is a covered entity, a business associate, or that
        this agreement is a HIPAA business associate agreement, and makes no HIPAA compliance claim.
        If your organization is a covered entity and intends to route protected health information
        through ProvisionLoop, stop and contact us first — a separate, counsel-reviewed arrangement
        would be required and none exists today.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "Termination and governing law",
    body: (
      <p>
        Either party may end this agreement at any time; ProvisionLoop may suspend access
        immediately where request data is at risk. Confidentiality, minimum-necessary use, incident
        notice, retention and deletion survive termination. Texas law governs, consistent with the{" "}
        <Link to="/legal/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

function PartnerDataPage() {
  return (
    <LegalDocPage
      docKey="partner_data"
      intro={
        <p className="text-sm">
          Identifiable assistance requests are the most sensitive data on the platform. Use them
          only for the request they belong to, keep them inside named authorized accounts, never let
          a sponsor near them, and tell us within 24 hours if something goes wrong.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
