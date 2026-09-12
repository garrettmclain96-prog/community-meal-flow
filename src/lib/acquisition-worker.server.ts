import { createClient } from "@supabase/supabase-js";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

const CTA_BY_ROLE = {
  household: "https://www.provisionloop.org/help",
  kitchen_operator: "https://www.provisionloop.org/kitchen",
  volunteer: "https://www.provisionloop.org/volunteer",
  partner: "https://www.provisionloop.org/partners",
  sponsor: "https://www.provisionloop.org/impact",
} as const;

const ROLE_LABEL = {
  household: "household",
  kitchen_operator: "kitchen operator",
  volunteer: "volunteer",
  partner: "community partner",
  sponsor: "sponsor",
} as const;

const DEFAULT_SUPABASE_URL = "https://myfgnukugylhqvmcjceu.supabase.co";
const DEFAULT_OUTREACH_FROM = "ProvisionLoop <outreach@provisionloop.org>";
const HEALTH_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
};

type LeadRole = keyof typeof CTA_BY_ROLE;
type OutreachStage = "initial" | "followup";

type ClaimedLead = {
  id: string;
  email: string;
  first_name: string | null;
  role: LeadRole;
  status: string;
  last_contacted_at: string | null;
  followup_count: number;
  stage: OutreachStage;
  claim_token: string;
  idempotency_key: string;
};

function env(name: string) {
  return process.env[name]?.trim() || "";
}

function getDb() {
  const url = env("SUPABASE_URL") || env("VITE_SUPABASE_URL") || DEFAULT_SUPABASE_URL;
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("missing_supabase_service_role_key");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authorize(request: Request): Promise<boolean> {
  const rejection = await authenticateCronRequest(request);
  return rejection === null;
}

/**
 * Public, non-sensitive readiness probe for the production watchdog.
 *
 * This intentionally returns only a boolean. It verifies that the secrets the
 * hourly worker requires are present and that the service-role credential can
 * execute the worker's read-only dry-run RPC. It never returns credentials,
 * eligible-lead counts, or configuration names to the caller.
 */
async function readinessResponse(): Promise<Response> {
  const missing = ["CRON_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY"].filter(
    (name) => !env(name),
  );
  if (missing.length > 0) {
    console.error("acquisition readiness missing runtime configuration", { missing });
    return Response.json({ ok: false }, { status: 503, headers: HEALTH_HEADERS });
  }

  try {
    const db = getDb();
    const { error } = await db.rpc("acquisition_outreach_dry_run");
    if (error) {
      console.error("acquisition readiness database check failed", { code: error.code });
      return Response.json({ ok: false }, { status: 503, headers: HEALTH_HEADERS });
    }
  } catch (error) {
    console.error("acquisition readiness failed", {
      category: errorCategory(error),
    });
    return Response.json({ ok: false }, { status: 503, headers: HEALTH_HEADERS });
  }

  return Response.json({ ok: true }, { status: 200, headers: HEALTH_HEADERS });
}

function emailFor(lead: ClaimedLead) {
  const first = lead.first_name ? ` ${lead.first_name}` : "";
  const label = ROLE_LABEL[lead.role];
  const cta = CTA_BY_ROLE[lead.role];
  if (lead.stage === "initial") {
    return {
      subject: "Your ProvisionLoop next step",
      text: `Hi${first},\n\nThanks for your interest in ProvisionLoop as a ${label}. No call or meeting is required.\n\nYour next step: ${cta}\n\nIf you want to see how ProvisionLoop approaches trust and accountability: https://www.provisionloop.org/trust-method\n\n— Garrett`,
    };
  }
  return {
    subject: "ProvisionLoop follow-up",
    text: `Hi${first},\n\nJust following up on your ProvisionLoop ${label} interest. No call or meeting is required. If you'd still like to continue, use this self-service next step: ${cta}\n\n— Garrett`,
  };
}

async function sendWithResend(lead: ClaimedLead) {
  const apiKey = env("RESEND_API_KEY");
  const from = env("PROVISIONLOOP_OUTREACH_FROM") || DEFAULT_OUTREACH_FROM;
  if (!apiKey) throw new Error("missing_resend_api_key");

  const message = emailFor(lead);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": lead.idempotency_key,
    },
    body: JSON.stringify({
      from,
      to: [lead.email],
      subject: message.subject,
      text: message.text,
      reply_to: env("PROVISIONLOOP_REPLY_TO") || undefined,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok || !payload.id) {
    throw new Error(`resend_${response.status}:${payload.message || "send_failed"}`);
  }
  return payload.id;
}

function errorCategory(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.startsWith("missing_")) return message.slice(0, 120);
  if (message.startsWith("resend_429")) return "provider_rate_limited";
  if (message.startsWith("resend_4")) return "provider_rejected";
  if (message.startsWith("resend_5")) return "provider_unavailable";
  return "provider_error";
}

export async function runAcquisitionWorker(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.searchParams.get("health") === "1") {
    return readinessResponse();
  }

  if (!env("CRON_SECRET")) {
    return Response.json({ ok: false, error: "missing_cron_secret" }, { status: 503 });
  }
  if (!(await authorize(request))) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let db;
  try {
    db = getDb();
  } catch (error) {
    return Response.json({ ok: false, error: errorCategory(error) }, { status: 503 });
  }

  const dryRun = url.searchParams.get("dry_run") === "1";
  if (dryRun) {
    const { data, error } = await db.rpc("acquisition_outreach_dry_run");
    if (error) {
      console.error("acquisition dry run failed", { code: error.code });
      return Response.json({ ok: false, error: "dry_run_query_failed" }, { status: 500 });
    }
    return Response.json({ ok: true, dry_run: true, eligible: data });
  }

  if (!env("RESEND_API_KEY")) {
    return Response.json({ ok: false, error: "missing_resend_api_key" }, { status: 503 });
  }

  const claimToken = crypto.randomUUID();
  const { data, error } = await db.rpc("claim_acquisition_outreach", {
    _limit: 25,
    _claim_token: claimToken,
  });
  if (error) {
    console.error("acquisition claim failed", { code: error.code });
    return Response.json({ ok: false, error: "claim_failed" }, { status: 500 });
  }

  const leads = (data || []) as ClaimedLead[];
  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    if (!(lead.role in CTA_BY_ROLE)) {
      failed += 1;
      await db.rpc("record_acquisition_outreach_failed", {
        _signup_id: lead.id,
        _claim_token: lead.claim_token,
        _stage: lead.stage,
        _error_category: "unknown_role",
      });
      continue;
    }

    try {
      const providerMessageId = await sendWithResend(lead);
      const { error: markError } = await db.rpc("record_acquisition_outreach_sent", {
        _signup_id: lead.id,
        _claim_token: lead.claim_token,
        _stage: lead.stage,
        _provider_message_id: providerMessageId,
      });
      if (markError) {
        console.error("email accepted but contact state update failed", {
          lead_id: lead.id,
          stage: lead.stage,
          code: markError.code,
          provider_message_id: providerMessageId,
        });
        failed += 1;
        continue;
      }
      sent += 1;
    } catch (error) {
      failed += 1;
      const category = errorCategory(error);
      console.error("acquisition send failed", {
        lead_id: lead.id,
        stage: lead.stage,
        category,
      });
      await db.rpc("record_acquisition_outreach_failed", {
        _signup_id: lead.id,
        _claim_token: lead.claim_token,
        _stage: lead.stage,
        _error_category: category,
      });
    }
  }

  return Response.json({ ok: failed === 0, claimed: leads.length, sent, failed });
}
