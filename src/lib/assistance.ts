import { supabase } from "@/integrations/supabase/client";

export interface AssistanceInput {
  firstName: string;
  email: string;
  phone: string;
  area: string;
  householdSize: number;
  needType: string;
  urgency: string;
  notes: string;
  consent: boolean;
}

export async function submitAssistanceRequest(input: AssistanceInput): Promise<string> {
  const { data, error } = await supabase.rpc("submit_assistance_request", {
    _first_name: input.firstName,
    _email: input.email,
    _phone: input.phone,
    _area: input.area,
    _household_size: input.householdSize,
    _need_type: input.needType,
    _urgency: input.urgency,
    _notes: input.notes,
    _consent: input.consent,
  });
  if (error) throw error;
  return data;
}
