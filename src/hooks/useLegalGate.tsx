import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  EMPTY_ACCEPTANCE,
  LegalAcceptance,
  isAcceptanceComplete,
  type LegalAcceptanceValue,
} from "@/components/LegalAcceptance";
import { useAuth } from "@/hooks/useAuth";
import { missingAcceptances, recordAcceptance } from "@/lib/legal/acceptance";
import { legalLabel, type LegalDocKey } from "@/lib/legal/registry";

export type LegalGate = {
  /** True only when every required document version is already accepted. */
  satisfied: boolean;
  loading: boolean;
  /** Render this above the governed control; null once satisfied. */
  gate: React.ReactNode;
  /**
   * Re-checks acceptance against the database. Every governed handler calls
   * this first so a direct handler call cannot bypass the UI gate.
   */
  assertAccepted: () => Promise<void>;
};

export function useLegalGate(options: {
  documents: LegalDocKey[];
  requireSignature?: boolean;
  context: string;
  intro?: string;
  enabled?: boolean;
}): LegalGate {
  const { documents, requireSignature = false, context, intro, enabled = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [value, setValue] = useState<LegalAcceptanceValue>(EMPTY_ACCEPTANCE);
  const [busy, setBusy] = useState(false);

  const key = documents.join("+");
  const query = useQuery({
    queryKey: ["legal-missing", user?.id, key],
    enabled: Boolean(user) && enabled,
    queryFn: () => missingAcceptances(documents),
  });

  const satisfied = Boolean(user) && query.isSuccess && (query.data?.length ?? 1) === 0;

  async function assertAccepted() {
    if (!user) throw new Error("Sign in first so your agreement can be recorded to your account.");
    const still = await missingAcceptances(documents);
    if (still.length) {
      throw new Error(`You must accept ${still.map(legalLabel).join(" and ")} before continuing.`);
    }
  }

  async function save() {
    if (!user) return;
    setBusy(true);
    try {
      await recordAcceptance(user.id, {
        keys: documents,
        signerName: requireSignature ? value.signerName : null,
        context,
      });
      await queryClient.invalidateQueries({ queryKey: ["legal-missing"] });
      setValue(EMPTY_ACCEPTANCE);
      toast.success("Agreement recorded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record your agreement");
    } finally {
      setBusy(false);
    }
  }

  const gate =
    !user || satisfied ? null : (
      <div className="grid gap-3">
        <LegalAcceptance
          documents={documents}
          value={value}
          onChange={setValue}
          requireSignature={requireSignature}
          intro={intro}
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy || !isAcceptanceComplete(value, requireSignature)}
          className="button-primary self-start disabled:opacity-50"
        >
          {busy ? "Recording…" : "Agree and continue"}
        </button>
      </div>
    );

  return { satisfied, loading: query.isLoading, gate, assertAccepted };
}
