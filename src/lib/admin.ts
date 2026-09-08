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
  if (error) throw error;
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
    .select(
      "id, user_id, request_type, details, contact_preference, status, internal_note, created_at",
    )
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
    .select(
      "id, user_id, full_name, email, postal_code, interest, note, status, internal_note, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type PendingKitchenClaim = {
  id: string;
  kitchen_id: string;
  user_id: string;
  role_at_kitchen: string | null;
  note: string | null;
  status: string;
  created_at: string;
  kitchen_name: string;
  city: string;
  neighborhood: string | null;
};

export async function listPendingKitchenClaims(): Promise<PendingKitchenClaim[]> {
  const { data: claims, error } = await supabase
    .from("kitchen_claims")
    .select("id, kitchen_id, user_id, role_at_kitchen, note, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!claims?.length) return [];

  const kitchenIds = [...new Set(claims.map((claim) => claim.kitchen_id))];
  const { data: kitchens, error: kitchensError } = await supabase
    .from("kitchens")
    .select("id, name, city, neighborhood")
    .in("id", kitchenIds);
  if (kitchensError) throw kitchensError;

  const byId = new Map((kitchens ?? []).map((kitchen) => [kitchen.id, kitchen]));
  return claims.map((claim) => {
    const kitchen = byId.get(claim.kitchen_id);
    return {
      ...claim,
      kitchen_name: kitchen?.name ?? "Unknown kitchen",
      city: kitchen?.city ?? "",
      neighborhood: kitchen?.neighborhood ?? null,
    };
  });
}

export type PendingKitchenRegistration = {
  id: string;
  owner_id: string | null;
  name: string;
  kind: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  website: string | null;
  summary: string | null;
  created_at: string;
};

export async function listPendingKitchenRegistrations(): Promise<PendingKitchenRegistration[]> {
  const { data, error } = await supabase
    .from("kitchens")
    .select("id, owner_id, name, kind, city, neighborhood, address, website, summary, created_at")
    .not("owner_id", "is", null)
    .eq("claimed", false)
    .eq("approved", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

type AuthorityEvidence = {
  method: string;
  note: string;
};

/**
 * Approval is intentionally interactive: the database refuses to approve a
 * provider without durable operator-authority evidence, and this internal UI
 * gathers the evidence before calling that RPC.
 */
function collectAuthorityEvidence(): AuthorityEvidence {
  if (typeof window === "undefined") {
    throw new Error("Authority verification must be completed in the admin UI.");
  }

  const method = window
    .prompt(
      "Verification method (examples: owner/manager confirmation, business email/domain, in-person confirmation, public business records):",
    )
    ?.trim();

  if (!method || method.length < 3) {
    throw new Error("Verification method is required before approval.");
  }

  const note = window
    .prompt(
      "What exactly did you verify? Record the concrete evidence checked (minimum 12 characters):",
    )
    ?.trim();

  if (!note || note.length < 12) {
    throw new Error("A concrete verification note is required before approval.");
  }

  return { method, note };
}

export async function reviewKitchenClaim(claimId: string, approve: boolean): Promise<void> {
  const evidence = approve ? collectAuthorityEvidence() : null;
  const { error } = await supabase.rpc(
    "review_kitchen_claim" as never,
    {
      _claim_id: claimId,
      _approve: approve,
      _verification_method: evidence?.method ?? null,
      _verification_note: evidence?.note ?? null,
    } as never,
  );
  if (error) throw error;
}

export async function reviewKitchenRegistration(kitchenId: string, approve: boolean): Promise<void> {
  const evidence = approve ? collectAuthorityEvidence() : null;
  const { error } = await supabase.rpc(
    "review_kitchen_registration" as never,
    {
      _kitchen_id: kitchenId,
      _approve: approve,
      _verification_method: evidence?.method ?? null,
      _verification_note: evidence?.note ?? null,
    } as never,
  );
  if (error) throw error;
}
