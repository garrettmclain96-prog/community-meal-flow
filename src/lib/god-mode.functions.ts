import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StatusCounts = Record<string, number>;

type GodModeData = {
  funding: {
    confirmedFundingCents: number;
    fundedMeals: number;
    payoutCents: number;
    ordersByStatus: StatusCounts;
    checkoutsByStatus: StatusCounts;
    payoutsByStatus: StatusCounts;
    sandboxCheckouts: number;
  };
  kitchens: {
    total: number;
    approved: number;
    claimed: number;
    test: number;
    fundingEnabled: number;
    claimsByStatus: StatusCounts;
  };
  operations: {
    deliveriesByStatus: StatusCounts;
    deliveredMeals: number;
    activeVolunteers: number;
    upcomingShifts: number;
    upcomingSlots: number;
  };
  partners: {
    total: number;
    approved: number;
    active: number;
    referralsByStatus: StatusCounts;
    assistanceByStatus: StatusCounts;
  };
  acquisition: {
    total: number;
    newLast7Days: number;
    uncontacted: number;
    asyncOnly: number;
    optedOut: number;
    followedUp: number;
    byInterest: StatusCounts;
    bySource: StatusCounts;
  };
  queues: {
    privacy: StatusCounts;
    refunds: StatusCounts;
    pilot: StatusCounts;
  };
  recentImpact: Array<{
    kind: string;
    meals: number;
    neighborhood: string | null;
    occurred_at: string;
  }>;
};

export const getGodModeSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");

    const { data: authorized, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "platform_admin",
    });

    if (roleError) throw new Error("Unable to verify God Mode access.");
    if (authorized !== true) return { authorized: false as const };

    // A platform-admin-gated SECURITY DEFINER RPC performs the cross-table
    // aggregation. This keeps the dashboard working with the authenticated
    // session and does not require a service-role secret in Vercel.
    const { data: rawData, error: snapshotError } = await context.supabase.rpc(
      "get_god_mode_snapshot_data" as never,
    );
    if (snapshotError || !rawData) throw new Error("Unable to load God Mode network state.");
    const data = rawData as unknown as GodModeData;

    const stripeSandboxConfigured = Boolean(process.env["STRIPE_SANDBOX_API_KEY"]);
    const stripeLiveConfigured = Boolean(process.env["STRIPE_LIVE_API_KEY"]);
    const webhookSandboxConfigured = Boolean(process.env["PAYMENTS_SANDBOX_WEBHOOK_SECRET"]);
    const webhookLiveConfigured = Boolean(process.env["PAYMENTS_LIVE_WEBHOOK_SECRET"]);
    const lovableGatewayConfigured = Boolean(process.env["LOVABLE_API_KEY"]);

    return {
      authorized: true as const,
      generatedAt: new Date().toISOString(),
      partialErrors: [] as string[],
      health: {
        database: true,
        auth: true,
        stripeConfigured: stripeSandboxConfigured || stripeLiveConfigured,
        stripeMode:
          stripeLiveConfigured && stripeSandboxConfigured
            ? "live + sandbox"
            : stripeLiveConfigured
              ? "live"
              : stripeSandboxConfigured
                ? "sandbox"
                : "unconfigured",
        webhookConfigured: webhookSandboxConfigured || webhookLiveConfigured,
        stripeSandboxConfigured,
        stripeLiveConfigured,
        webhookSandboxConfigured,
        webhookLiveConfigured,
        lovableGatewayConfigured,
        openAiConfigured: Boolean(process.env["OPENAI_API_KEY"]),
      },
      ...data,
    };
  });
