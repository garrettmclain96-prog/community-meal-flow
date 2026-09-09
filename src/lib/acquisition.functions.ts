import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Acquisition outreach job interface.
 *
 * An external automation must never hold unrestricted raw SQL access: that
 * would bypass RLS, expose every column of every table (household PII,
 * payments, partner data), allow arbitrary destructive writes and require a
 * service-role credential to live outside the platform. Instead the automation
 * authenticates as a platform admin and calls these narrow operations, which
 * return only the fields required to send an email and can only apply the two
 * specific, idempotent contact-state transitions.
 */

export type OutreachStage = "initial" | "followup";

export type OutreachTask = {
  id: string;
  email: string;
  first_name: string | null;
  role: string;
  status: string;
  last_contacted_at: string | null;
  followup_count: number;
  stage: OutreachStage;
};

async function assertAdmin(context: { supabase: unknown; userId: string }) {
  const supabase = context.supabase as {
    rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "platform_admin",
  });
  if (error) throw new Error("Unable to verify acquisition access.");
  if (data !== true) throw new Error("Not authorized for acquisition outreach.");
  return supabase;
}

/** Returns leads due an initial contact or their single follow-up. Read-only. */
export const listOutreachQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data?: { limit?: number }) => ({
    limit: Math.max(1, Math.min(Math.trunc(data?.limit ?? 50), 200)),
  }))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const supabase = await assertAdmin(context);

    const { data: rows, error } = await supabase.rpc("acquisition_outreach_queue", {
      _limit: data.limit,
    });
    if (error) throw new Error("Unable to load the acquisition outreach queue.");

    return { tasks: (rows ?? []) as OutreachTask[] };
  });

/** Records a successful FIRST outreach email. Call only after the send succeeded. */
export const markInitialOutreachSent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; sent: boolean }) => {
    const id = (data?.id ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("An exact lead id is required.");
    if (data.sent !== true) throw new Error("Only a confirmed successful send may be recorded.");
    return { id };
  })
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context);
    const { data: result, error } = await supabase.rpc("mark_acquisition_initial_sent", {
      _signup_id: data.id,
    });
    if (error) throw new Error("That lead is not eligible for an initial send.");
    return result as {
      id: string;
      status: string;
      last_contacted_at: string;
      followup_count: number;
    };
  });

/** Records the single successful FOLLOW-UP email. Call only after the send succeeded. */
export const markFollowupOutreachSent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; sent: boolean }) => {
    const id = (data?.id ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("An exact lead id is required.");
    if (data.sent !== true) throw new Error("Only a confirmed successful send may be recorded.");
    return { id };
  })
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context);
    const { data: result, error } = await supabase.rpc("mark_acquisition_followup_sent", {
      _signup_id: data.id,
    });
    if (error) throw new Error("That lead is not eligible for a follow-up send.");
    return result as {
      id: string;
      status: string;
      last_contacted_at: string;
      followup_count: number;
    };
  });
