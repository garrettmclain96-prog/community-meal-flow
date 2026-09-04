import { supabase } from "@/integrations/supabase/client";

export const PILOT_LIVE_DATE = "November 3, 2026";
export const PILOT_LIVE_ISO = "2026-11-03";

export type PilotInterest =
  | "household"
  | "kitchen_operator"
  | "volunteer"
  | "partner"
  | "sponsor";

export const PILOT_INTEREST_LABEL: Record<PilotInterest, string> = {
  household: "Household that may need food help",
  kitchen_operator: "Kitchen or restaurant operator",
  volunteer: "Volunteer (prep or delivery)",
  partner: "Community partner organization",
  sponsor: "Sponsor or funder",
};

export type PilotSignupRow = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  postal_code: string | null;
  interest: string;
  note: string | null;
  status: string;
  internal_note: string | null;
  created_at: string;
};

export async function submitPilotSignup(input: {
  userId: string;
  fullName: string;
  email: string;
  postalCode: string;
  interest: PilotInterest;
  note: string;
}) {
  const { error } = await supabase.from("pilot_signups").insert({
    user_id: input.userId,
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    postal_code: input.postalCode.trim() || null,
    interest: input.interest,
    note: input.note.trim() || null,
  });
  if (error) throw error;
}

export async function listMyPilotSignups(): Promise<PilotSignupRow[]> {
  const { data, error } = await supabase
    .from("pilot_signups")
    .select("id, user_id, full_name, email, postal_code, interest, note, status, internal_note, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PilotSignupRow[];
}
