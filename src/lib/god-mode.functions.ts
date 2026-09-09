import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function tally(rows: Array<{ status: string | null }>) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.status || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function tallyValues(values: Array<string | null | undefined>) {
  return values.reduce<Record<string, number>>((acc, value) => {
    const key = value || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

type PilotLeadRow = {
  status: string | null;
  interest: string | null;
  lead_source: string | null;
  preferred_contact: string | null;
  created_at: string;
  last_contacted_at: string | null;
  followup_count: number | null;
  do_not_contact: boolean | null;
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

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      fundedOrdersResult,
      checkoutsResult,
      payoutsResult,
      kitchensResult,
      claimsResult,
      deliveriesResult,
      volunteersResult,
      shiftsResult,
      partnersResult,
      referralsResult,
      assistanceResult,
      privacyResult,
      refundsResult,
      pilotResult,
      impactResult,
    ] = await Promise.all([
      supabaseAdmin.from("funded_orders").select("status, amount_cents, meals_funded, paid"),
      supabaseAdmin.from("sponsor_checkouts").select("status, amount_cents, meals, environment"),
      supabaseAdmin.from("payouts").select("status, amount_cents"),
      supabaseAdmin
        .from("kitchens")
        .select("approved, active, claimed, is_test, payout_account_id, payout_status"),
      supabaseAdmin.from("kitchen_claims").select("status"),
      supabaseAdmin.from("delivery_runs").select("status, meals"),
      supabaseAdmin.from("volunteers").select("active"),
      supabaseAdmin
        .from("volunteer_shifts")
        .select("starts_at, slots")
        .gte("starts_at", new Date().toISOString()),
      supabaseAdmin.from("partner_organizations").select("approved, active"),
      supabaseAdmin.from("partner_referrals").select("status"),
      supabaseAdmin.from("assistance_requests").select("status"),
      supabaseAdmin.from("privacy_requests").select("status"),
      supabaseAdmin.from("refund_requests").select("status"),
      supabaseAdmin
        .from("pilot_signups")
        .select(
          "status, interest, lead_source, preferred_contact, created_at, last_contacted_at, followup_count, do_not_contact",
        ),
      supabaseAdmin
        .from("impact_events")
        .select("kind, meals, neighborhood, occurred_at")
        .order("occurred_at", { ascending: false })
        .limit(8),
    ]);

    const errors = [
      fundedOrdersResult.error,
      checkoutsResult.error,
      payoutsResult.error,
      kitchensResult.error,
      claimsResult.error,
      deliveriesResult.error,
      volunteersResult.error,
      shiftsResult.error,
      partnersResult.error,
      referralsResult.error,
      assistanceResult.error,
      privacyResult.error,
      refundsResult.error,
      pilotResult.error,
      impactResult.error,
    ]
      .filter(Boolean)
      .map((error) => error!.message);

    const fundedOrders = fundedOrdersResult.data ?? [];
    const checkouts = checkoutsResult.data ?? [];
    const payouts = payoutsResult.data ?? [];
    const kitchens = kitchensResult.data ?? [];
    const claims = claimsResult.data ?? [];
    const deliveries = deliveriesResult.data ?? [];
    const volunteers = volunteersResult.data ?? [];
    const shifts = shiftsResult.data ?? [];
    const partners = partnersResult.data ?? [];
    const referrals = referralsResult.data ?? [];
    const assistance = assistanceResult.data ?? [];
    const privacy = privacyResult.data ?? [];
    const refunds = refundsResult.data ?? [];
    const pilot = (pilotResult.data ?? []) as unknown as PilotLeadRow[];

    const confirmedFundingCents = fundedOrders
      .filter((row) => row.paid)
      .reduce((sum, row) => sum + row.amount_cents, 0);
    const fundedMeals = fundedOrders.reduce((sum, row) => sum + row.meals_funded, 0);
    const deliveredMeals = deliveries
      .filter((row) => row.status === "delivered")
      .reduce((sum, row) => sum + row.meals, 0);
    const payoutCents = payouts
      .filter((row) => row.status === "paid")
      .reduce((sum, row) => sum + row.amount_cents, 0);

    const stripeSandboxConfigured = Boolean(process.env["STRIPE_SANDBOX_API_KEY"]);
    const stripeLiveConfigured = Boolean(process.env["STRIPE_LIVE_API_KEY"]);
    const webhookSandboxConfigured = Boolean(process.env["PAYMENTS_SANDBOX_WEBHOOK_SECRET"]);
    const webhookLiveConfigured = Boolean(process.env["PAYMENTS_LIVE_WEBHOOK_SECRET"]);
    const lovableGatewayConfigured = Boolean(process.env["LOVABLE_API_KEY"]);
    const sevenDaysAgo = Date.now() - 7 * 86_400_000;

    return {
      authorized: true as const,
      generatedAt: new Date().toISOString(),
      partialErrors: errors,
      health: {
        database: errors.length === 0,
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
      funding: {
        confirmedFundingCents,
        fundedMeals,
        payoutCents,
        ordersByStatus: tally(fundedOrders),
        checkoutsByStatus: tally(checkouts),
        payoutsByStatus: tally(payouts),
        sandboxCheckouts: checkouts.filter((row) => row.environment !== "live").length,
      },
      kitchens: {
        total: kitchens.length,
        approved: kitchens.filter((row) => row.approved).length,
        claimed: kitchens.filter((row) => row.claimed).length,
        test: kitchens.filter((row) => row.is_test).length,
        fundingEnabled: kitchens.filter(
          (row) =>
            row.approved &&
            row.active &&
            row.claimed &&
            row.payout_status === "ready" &&
            Boolean(row.payout_account_id),
        ).length,
        claimsByStatus: tally(claims),
      },
      operations: {
        deliveriesByStatus: tally(deliveries),
        deliveredMeals,
        activeVolunteers: volunteers.filter((row) => row.active).length,
        upcomingShifts: shifts.length,
        upcomingSlots: shifts.reduce((sum, row) => sum + row.slots, 0),
      },
      partners: {
        total: partners.length,
        approved: partners.filter((row) => row.approved).length,
        active: partners.filter((row) => row.active).length,
        referralsByStatus: tally(referrals),
        assistanceByStatus: tally(assistance),
      },
      acquisition: {
        total: pilot.length,
        newLast7Days: pilot.filter((row) => Date.parse(row.created_at) >= sevenDaysAgo).length,
        uncontacted: pilot.filter(
          (row) => !row.last_contacted_at && row.do_not_contact !== true,
        ).length,
        asyncOnly: pilot.filter((row) => row.preferred_contact === "email_only").length,
        optedOut: pilot.filter((row) => row.do_not_contact === true).length,
        followedUp: pilot.filter((row) => (row.followup_count ?? 0) > 0).length,
        byInterest: tallyValues(pilot.map((row) => row.interest)),
        bySource: tallyValues(pilot.map((row) => row.lead_source)),
      },
      queues: {
        privacy: tally(privacy),
        refunds: tally(refunds),
        pilot: tally(pilot),
      },
      recentImpact: impactResult.data ?? [],
    };
  });
