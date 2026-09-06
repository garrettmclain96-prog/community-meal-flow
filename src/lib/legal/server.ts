import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import { LEGAL_DOCUMENTS, type LegalDocKey } from "./registry";

/**
 * Returns required legal documents the authenticated user has not accepted at
 * the currently published version. Intended for server-side governed actions
 * so direct callers cannot bypass the UI legal gate.
 */
export async function missingServerAcceptances(
  supabase: SupabaseClient<Database>,
  userId: string,
  keys: readonly LegalDocKey[],
): Promise<LegalDocKey[]> {
  const uniqueKeys = [...new Set(keys)];
  if (!uniqueKeys.length) return [];

  const { data, error } = await supabase
    .from("legal_document_acceptances")
    .select("document_key, document_version")
    .eq("user_id", userId)
    .in("document_key", uniqueKeys);

  // Legal verification fails closed. A database/read failure must never be
  // interpreted as consent.
  if (error) throw new Error("Could not verify required legal acceptance.");

  return uniqueKeys.filter(
    (key) =>
      !(data ?? []).some(
        (row) =>
          row.document_key === key && row.document_version === LEGAL_DOCUMENTS[key].version,
      ),
  );
}

export function legalAcceptanceError(keys: readonly LegalDocKey[]): string {
  if (!keys.length) return "";
  const names = keys.map((key) => LEGAL_DOCUMENTS[key].shortTitle);
  return `Accept the current ${names.join(", ")} before continuing.`;
}
