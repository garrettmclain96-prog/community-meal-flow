import { supabase } from "@/integrations/supabase/client";

export const PILOT_PHASE_LABEL = "Founding pilot intake";

export type PilotInterest = "household" | "kitchen_operator" | "volunteer" | "partner" | "sponsor";

export const PILOT_INTEREST_LABEL: Record<PilotInterest, string> = {
  household: "Household that may need food help",
  kitchen_operator: "Kitchen or restaurant operator",
  volunteer: "Volunteer (prep or delivery)",
  partner: "Community partner organization",
  sponsor: "Sponsor or funder",
};

export const PILOT_NEXT_STEP: Record<
  PilotInterest,
  { title: string; description: string; href: string; cta: string }
> = {
  household: {
    title: "Request help privately",
    description:
      "Use the household help flow when you are ready. Account and privacy/legal gates appear only before protected information is submitted.",
    href: "/help",
    cta: "Open household help",
  },
  kitchen_operator: {
    title: "Review the kitchen workflow",
    description:
      "See the directory, claim or register your kitchen, and complete operator verification asynchronously. No sales call is required.",
    href: "/kitchen",
    cta: "Open kitchen workflow",
  },
  volunteer: {
    title: "Review volunteer options",
    description:
      "See how prep and delivery work. The waiver is completed online before protected volunteer actions.",
    href: "/volunteer",
    cta: "Open volunteer workflow",
  },
  partner: {
    title: "Review partner onboarding",
    description:
      "See the referral and privacy model, then apply through the protected partner workflow when your organization is ready.",
    href: "/partners",
    cta: "Open partner workflow",
  },
  sponsor: {
    title: "Review the funding model",
    description:
      "See how accountable meal funding is designed. Live payment activation remains intentionally gated during the pilot build-out.",
    href: "/impact",
    cta: "Review funding model",
  },
};

export type PilotSignupRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  postal_code: string | null;
  interest: string;
  note: string | null;
  organization_name?: string | null;
  lead_source?: string | null;
  preferred_contact?: string | null;
  status: string;
  internal_note: string | null;
  created_at: string;
};

/** Signed-in users can review only sign-ups already linked to their account. */
export async function listMyPilotSignups(): Promise<PilotSignupRow[]> {
  const { data, error } = await supabase
    .from("pilot_signups")
    .select(
      "id, user_id, full_name, email, postal_code, interest, note, status, internal_note, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PilotSignupRow[];
}
