import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

function env(name: string) {
  return process.env[name]?.trim() || "";
}

async function handle(request: Request) {
  const rejection = await authenticateCronRequest(request);
  if (rejection) return rejection;

  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "PROVISIONLOOP_OUTREACH_FROM",
  ] as const;
  const missing = required.filter((name) => !env(name));

  if (missing.length > 0) {
    console.error("acquisition runtime config missing", { missing });
    return Response.json({ ok: false, missing }, { status: 503 });
  }

  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db.rpc("acquisition_outreach_dry_run");
  if (error) {
    console.error("acquisition runtime db check failed", { code: error.code });
    return Response.json({ ok: false, error: "db_check_failed" }, { status: 500 });
  }

  console.info("acquisition runtime health ok");
  return Response.json({ ok: true });
}

export const Route = createFileRoute("/api/public/hooks/acquisition-worker-health")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
    },
  },
});
