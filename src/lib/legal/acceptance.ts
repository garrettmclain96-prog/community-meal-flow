import { supabase } from "@/integrations/supabase/client";

import { LEGAL_DOCUMENTS, type LegalDocKey } from "./registry";

export type AcceptanceInput = {
  keys: LegalDocKey[];
  signerName?: string | null;
  context?: string | null;
};

export type AcceptanceRow = {
  document_key: string;
  document_version: string;
  signer_name: string | null;
  context: string | null;
  accepted_at: string;
};

const PENDING_KEY = "provisionloop.pending-legal-acceptances";

/** Acceptances captured before an account existed (sign-up), flushed after sign-in. */
export function queuePendingAcceptance(input: AcceptanceInput) {
  if (typeof window === "undefined") return;
  try {
    const existing = readPending();
    window.localStorage.setItem(PENDING_KEY, JSON.stringify([...existing, input]));
  } catch {
    /* storage unavailable — acceptance is re-prompted on the next governed action */
  }
}

function readPending(): AcceptanceInput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AcceptanceInput[]) : [];
  } catch {
    return [];
  }
}

function clearPending() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** Records acceptance of one or more document versions for the signed-in user. */
export async function recordAcceptance(userId: string, input: AcceptanceInput): Promise<void> {
  const rows = input.keys.map((key) => ({
    user_id: userId,
    document_key: key,
    document_version: LEGAL_DOCUMENTS[key].version,
    signer_name: input.signerName?.trim() || null,
    context: input.context ?? null,
  }));
  if (!rows.length) return;
  const { error } = await supabase
    .from("legal_document_acceptances")
    .upsert(rows, { onConflict: "user_id,document_key,document_version", ignoreDuplicates: true });
  if (error) throw error;
}

/** Flushes any acceptance captured before the account existed. Safe to call repeatedly. */
export async function flushPendingAcceptances(userId: string): Promise<void> {
  const pending = readPending();
  if (!pending.length) return;
  for (const input of pending) {
    try {
      await recordAcceptance(userId, input);
    } catch {
      return; // keep the queue so the next sign-in retries
    }
  }
  clearPending();
}

export async function listMyAcceptances(): Promise<AcceptanceRow[]> {
  const { data, error } = await supabase
    .from("legal_document_acceptances")
    .select("document_key, document_version, signer_name, context, accepted_at")
    .order("accepted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AcceptanceRow[];
}

/** Which of `keys` the signed-in user has NOT accepted at the current version. */
export async function missingAcceptances(keys: LegalDocKey[]): Promise<LegalDocKey[]> {
  const rows = await listMyAcceptances();
  return keys.filter(
    (key) =>
      !rows.some(
        (row) =>
          row.document_key === key && row.document_version === LEGAL_DOCUMENTS[key].version,
      ),
  );
}

export type PrivacyRequestType =
  | "access"
  | "correction"
  | "deletion"
  | "portability"
  | "opt_out"
  | "appeal";

export async function submitPrivacyRequest(input: {
  userId: string;
  requestType: PrivacyRequestType;
  details: string;
  contactPreference?: string;
}) {
  const { error } = await supabase.from("privacy_requests").insert({
    user_id: input.userId,
    request_type: input.requestType,
    details: input.details.trim() || null,
    contact_preference: input.contactPreference?.trim() || null,
  });
  if (error) throw error;
}

export async function listMyPrivacyRequests() {
  const { data, error } = await supabase
    .from("privacy_requests")
    .select("id, request_type, details, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type RefundRequestType =
  | "refund"
  | "cancel_subscription"
  | "duplicate"
  | "unauthorized"
  | "error";

export async function submitRefundRequest(input: {
  userId: string;
  requestType: RefundRequestType;
  referenceId: string;
  reason: string;
}) {
  const { error } = await supabase.from("refund_requests").insert({
    user_id: input.userId,
    request_type: input.requestType,
    reference_id: input.referenceId.trim() || null,
    reason: input.reason.trim() || null,
  });
  if (error) throw error;
}

export async function listMyRefundRequests() {
  const { data, error } = await supabase
    .from("refund_requests")
    .select("id, request_type, reference_id, reason, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
