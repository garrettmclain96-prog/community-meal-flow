import { supabase } from "@/integrations/supabase/client";

export type PartnerRequest = {
  first_name: string;
  email: string | null;
  phone: string | null;
  area: string;
  household_size: number;
  need_type: string;
  urgency: string;
  notes: string | null;
};

export type PartnerReferral = {
  id: string;
  status: string;
  scheduled_for: string | null;
  kitchen_id: string | null;
  created_at: string;
  request: PartnerRequest;
};

export type PartnerWorkspace = {
  organization: {
    id: string;
    name: string;
    kind: string;
    website: string | null;
    service_areas: string[];
    approved: boolean;
    active: boolean;
  };
  referrals: PartnerReferral[];
};

export async function getPartnerWorkspace(): Promise<PartnerWorkspace | null> {
  const { data, error } = await supabase.rpc("get_my_partner_workspace");
  if (error) throw error;
  return (data as PartnerWorkspace | null) ?? null;
}

export async function applyPartner(input: {
  name: string;
  kind: string;
  website: string;
  serviceAreas: string[];
}) {
  const { data, error } = await supabase.rpc("apply_partner_organization", {
    _name: input.name,
    _kind: input.kind,
    _website: input.website,
    _service_areas: input.serviceAreas,
  });
  if (error) throw error;
  return data;
}

export async function updateReferral(input: {
  referralId: string;
  status: string;
  scheduledFor?: string;
  outcome?: string;
  meals?: number;
}) {
  const { error } = await supabase.rpc("update_partner_referral", {
    _referral_id: input.referralId,
    _status: input.status,
    _scheduled_for: input.scheduledFor,
    _outcome: input.outcome,
    _meals: input.meals ?? 0,
  });
  if (error) throw error;
}
