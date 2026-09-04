import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalDocPage, legalHead, type LegalSection } from "@/components/LegalDocPage";

export const Route = createFileRoute("/legal/volunteer-waiver")({
  head: legalHead(
    "volunteer_waiver",
    "ProvisionLoop Volunteer Assumption of Risk, Release & Waiver v1.0 for Texas: adults 18+, activity risks, conspicuous release of ordinary negligence, and carve-outs that cannot be waived.",
  ),
  component: VolunteerWaiverPage,
});

const SECTIONS: LegalSection[] = [
  {
    id: "adults",
    heading: "Adults only",
    body: (
      <p className="legal-callout">
        You must be <strong>18 years of age or older</strong> to volunteer through ProvisionLoop
        during this pilot. There is no parent or guardian consent flow, and no minor may sign up,
        claim a shift or join a delivery run. A guardian flow would require counsel review before it
        exists.
      </p>
    ),
  },
  {
    id: "activities",
    heading: "What volunteering involves",
    body: (
      <>
        <p>Volunteer activities may include any of the following:</p>
        <ul>
          <li>Food preparation, cooking, portioning, packaging and cleaning in a kitchen.</li>
          <li>Lifting, carrying, loading and unloading boxes, coolers and equipment.</li>
          <li>
            Driving your own vehicle, or riding in a vehicle, to and from pickup and drop points.
          </li>
          <li>Delivery on foot, including stairs, driveways, curbs and unfamiliar property.</li>
          <li>
            Working at third-party premises that ProvisionLoop does not own, control or inspect.
          </li>
          <li>
            Contact with food and allergens, including where cross-contact cannot be excluded.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "risks",
    heading: "Assumption of inherent risks",
    body: (
      <>
        <p className="legal-callout">
          I UNDERSTAND THAT VOLUNTEERING INVOLVES INHERENT RISKS AND I VOLUNTARILY ASSUME THEM.
          Those risks include, without limitation: slips, trips and falls; cuts, burns and scalds
          from hot or sharp equipment; strains and other injury from lifting or repetitive work;
          heat, cold, storms, humidity and other weather exposure; traffic collisions and other road
          hazards while driving, riding, loading or walking; exposure to allergens and foodborne
          illness; exposure to communicable illness; the acts or omissions of other volunteers,
          kitchens, recipients, and other third parties; and conditions at premises ProvisionLoop
          does not own or control. I accept the risk of injury, illness, disability, death and
          property damage arising from these activities.
        </p>
      </>
    ),
  },
  {
    id: "fitness",
    heading: "Health, fitness and instructions",
    body: (
      <ul>
        <li>
          You confirm you are physically able to do the activity you sign up for, or that you will
          decline it.
        </li>
        <li>
          You will follow the safety instructions of the kitchen, the site and ProvisionLoop, and
          will use any required protective equipment.
        </li>
        <li>
          You will not volunteer while impaired by alcohol, drugs or medication that affects your
          ability to work or drive safely.
        </li>
        <li>You will not volunteer while ill in a way that could put food or people at risk.</li>
        <li>You will stop and report a condition you believe is unsafe.</li>
      </ul>
    ),
  },
  {
    id: "driving",
    heading: "If you drive",
    body: (
      <p>
        If you use your own vehicle you confirm that you hold a valid driver&apos;s licence, that
        the vehicle is roadworthy and legally registered, and that you carry at least the automobile
        liability insurance Texas law requires. Your own insurance is primary for any incident
        involving your vehicle. ProvisionLoop does not provide vehicle insurance and does not insure
        volunteers.
      </p>
    ),
  },
  {
    id: "no-employment",
    heading: "No employment, no compensation",
    body: (
      <p>
        You volunteer freely. You are not an employee, contractor, agent or partner of ProvisionLoop
        or of any kitchen, and you will not be paid wages, benefits, workers&apos; compensation or
        expenses for volunteering. You may stop at any time. Hours logged in the app are a record of
        contribution, not an entitlement to payment.
      </p>
    ),
  },
  {
    id: "emergency",
    heading: "Emergency contact and medical consent",
    body: (
      <p>
        You may give an emergency contact so we can reach someone if you are hurt while
        volunteering. You consent to ProvisionLoop, a kitchen or a site calling emergency services
        and arranging emergency medical assistance for you if you appear to need it and cannot
        consent yourself. This consent is limited to emergency assistance. You are responsible for
        the cost of any medical care you receive.
      </p>
    ),
  },
  {
    id: "release",
    heading: "Release of claims — ordinary negligence",
    body: (
      <>
        <p className="legal-callout legal-conspicuous">
          IN EXCHANGE FOR BEING ALLOWED TO VOLUNTEER, I RELEASE, WAIVE AND DISCHARGE PROVISIONLOOP
          AND ITS OFFICERS, DIRECTORS, EMPLOYEES, CONTRACTORS AND AGENTS FROM ALL CLAIMS, DEMANDS,
          CAUSES OF ACTION, LOSSES, COSTS AND DAMAGES FOR PERSONAL INJURY, ILLNESS, DEATH OR
          PROPERTY DAMAGE THAT ARISE OUT OF MY VOLUNTEER ACTIVITIES,{" "}
          <strong>
            INCLUDING CLAIMS CAUSED IN WHOLE OR IN PART BY PROVISIONLOOP&apos;S OWN ORDINARY
            NEGLIGENCE
          </strong>
          . I HAVE READ THIS PARAGRAPH, I UNDERSTAND THAT IT RELEASES CLAIMS FOR
          PROVISIONLOOP&apos;S ORDINARY NEGLIGENCE, AND I AGREE TO IT FREELY.
        </p>
        <p>
          This release is printed in capitals and set apart deliberately so that its effect is
          conspicuous and unmistakable, as Texas law requires for a pre-injury release of a
          party&apos;s own negligence.
        </p>
      </>
    ),
  },
  {
    id: "carve-outs",
    heading: "What this release does NOT cover",
    body: (
      <>
        <p className="legal-callout legal-conspicuous">
          THIS RELEASE DOES NOT APPLY TO, AND NOTHING IN IT WAIVES, CLAIMS ARISING FROM
          PROVISIONLOOP&apos;S GROSS NEGLIGENCE, RECKLESS CONDUCT, INTENTIONAL OR WILLFUL
          MISCONDUCT, OR FRAUD, OR ANY LIABILITY OR RIGHT THAT CANNOT LAWFULLY BE WAIVED OR RELEASED
          UNDER TEXAS OR FEDERAL LAW.
        </p>
        <p>
          It also does not release any third party — a kitchen, a site owner, another volunteer or
          another driver — from their own responsibility for their own conduct.
        </p>
        <p>
          If any part of this release is held unenforceable, the rest stays in effect to the maximum
          extent the law allows.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    heading: "Your indemnity — limited",
    body: (
      <p className="legal-callout">
        You will indemnify ProvisionLoop for claims arising from your own unlawful, reckless or
        intentional conduct, or your breach of this waiver or the{" "}
        <Link to="/legal/terms">Terms of Service</Link>. This indemnity does <strong>not</strong>{" "}
        cover claims arising from ProvisionLoop&apos;s own negligence, gross negligence, reckless or
        willful misconduct.
      </p>
    ),
  },
  {
    id: "privacy",
    heading: "Volunteer data and recipient privacy",
    body: (
      <p>
        Your volunteer profile, availability, shifts and runs are private to you, the kitchen you
        are rostered with, and ProvisionLoop — see the{" "}
        <Link to="/legal/privacy">Privacy Policy</Link>. You receive drop points and run
        instructions, never a household&apos;s identity beyond what the handoff requires, and you
        must not record, share, photograph or publish anything that identifies a recipient.
      </p>
    ),
  },
  {
    id: "media",
    heading: "Photo and media consent — separate and optional",
    body: (
      <p className="legal-callout">
        Photo and media consent is <strong>not</strong> part of this waiver and is not required to
        volunteer. If ProvisionLoop or a kitchen ever wants to photograph, record or publish your
        image or name, you will be asked separately at that time and you may decline with no effect
        on your ability to volunteer. Declining is always allowed, and consent may be withdrawn.
      </p>
    ),
  },
  {
    id: "law",
    heading: "Governing law and acknowledgement",
    body: (
      <p>
        This waiver is governed by Texas law and is intended to be as broad as Texas law allows,
        subject to the carve-outs above. By accepting it electronically you confirm you are 18 or
        over, that you have read and understood it, that no one pressured you, and that you intend
        your typed name to be your signature under Texas Business &amp; Commerce Code Chapter 322.
      </p>
    ),
  },
];

function VolunteerWaiverPage() {
  return (
    <LegalDocPage
      docKey="volunteer_waiver"
      intro={
        <p className="text-sm">
          Read section 6 and section 7 carefully: you assume the inherent risks of food work,
          lifting and delivery, and you release ProvisionLoop&apos;s{" "}
          <strong>ordinary negligence</strong>. You do <strong>not</strong> waive gross negligence,
          reckless or willful misconduct, or any right that cannot lawfully be waived. Photo consent
          is separate and optional.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
