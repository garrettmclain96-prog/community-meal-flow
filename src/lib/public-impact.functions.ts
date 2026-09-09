import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { supabase } from "@/integrations/supabase/client";

type PublicImpactSnapshot = {
  mealsFunded: number;
  mealsDelivered: number;
  providersMapped: number;
  fundingEnabledKitchens: number;
  verifiedOperators: number;
  neighborhoods: Array<{ neighborhood: string; meals: number }>;
  recent: Array<{
    id: string;
    kind: string;
    meals: number;
    neighborhood: string | null;
    occurred_at: string;
  }>;
};

/**
 * Public aggregate proof snapshot.
 *
 * A narrowly scoped SECURITY DEFINER RPC joins impact rows to non-test kitchens
 * and returns only sanitized aggregates/recent public facts. The browser never
 * receives raw order identifiers, payout identifiers or sandbox activity.
 */
export const getPublicImpactSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  const { data, error } = await supabase.rpc("get_public_impact_snapshot" as never);
  if (error || !data) throw new Error("Unable to load public impact snapshot.");

  return data as unknown as PublicImpactSnapshot;
});
