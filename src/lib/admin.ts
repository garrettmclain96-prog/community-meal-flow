import { supabase } from "@/integrations/supabase/client";

export const ADMIN_STATUSES = ["queued_manual_review", "in_progress", "resolved"] as const;
export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = {
  queued_manual_review: "Queued",
  in_progress: "In progress",
  resolved: "Resolved",
};

/** Server-side role check via the security-definer has_role function. Never client state. */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "platform_admin",
  });
  if (error) return false;
  return data === true;
}

export type AdminRequestRow = {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  internal_note: string | null;
  created_at: string;
  details?: string | null;
  contact_preference?: string | null;
  reference_id?: string | null;
  reason?: string | null;
};

export async function listAllPrivacyRequests(): Promise<AdminRequestRow[]> {
  const { data, error } = await supabase
    .from("privacy_requests")
    .select("id, user_id, request_type, details, contact_preference, status, internal_note, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminRequestRow[];
}

export async function listAllRefundRequests(): Promise<AdminRequestRow[]> {
  const { data, error } = await supabase
    .from("refund_requests")
    .select("id, user_id, request_type, reference_id, reason, status, internal_note, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminRequestRow[];
}

type QueueTable = "privacy_requests" | "refund_requests" | "pilot_signups";

export async function updateQueueRow(
  table: QueueTable,
  id: string,
  patch: { status: AdminStatus; internal_note: string | null },
) {
  const { error } = await supabase
    .from(table)
    .update({
      status: patch.status,
      internal_note: patch.internal_note,
      ...(patch.status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function listAllPilotSignups() {
  const { data, error } = await supabase
    .from("pilot_signups")
    .select("id, user_id, full_name, email, postal_code, interest, note, status, internal_note, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
