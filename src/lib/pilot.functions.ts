import { createServerFn } from "@tanstack/react-start";

import type { PilotInterest } from "./pilot";

const INTERESTS: PilotInterest[] = [
  "household",
  "kitchen_operator",
  "volunteer",
  "partner",
  "sponsor",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: string | undefined, max: number) {
  return (value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

export const submitPilotLead = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      fullName: string;
      email: string;
      postalCode?: string;
      interest: PilotInterest;
      organizationName?: string;
      note?: string;
      leadSource?: string;
      referrer?: string;
      authoritySelfDeclared?: boolean;
      transportAvailable?: boolean;
      website?: string;
    }) => {
      const fullName = clean(data.fullName, 120);
      const email = clean(data.email, 254).toLowerCase();
      const postalCode = clean(data.postalCode, 16);
      const organizationName = clean(data.organizationName, 160);
      const note = clean(data.note, 1000);
      const leadSource = clean(data.leadSource, 100) || "website";
      const referrer = clean(data.referrer, 300);
      const website = clean(data.website, 300);

      if (!fullName) throw new Error("Your name is required.");
      if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address.");
      if (!INTERESTS.includes(data.interest)) throw new Error("Choose a valid pilot role.");
      if (
        (data.interest === "kitchen_operator" || data.interest === "partner") &&
        !organizationName
      ) {
        throw new Error("Add the kitchen or organization name so we can route your intake correctly.");
      }

      return {
        fullName,
        email,
        postalCode,
        interest: data.interest,
        organizationName,
        note,
        leadSource,
        referrer,
        authoritySelfDeclared: data.authoritySelfDeclared === true,
        transportAvailable: data.transportAvailable === true,
        website,
      };
    },
  )
  .handler(async ({ data }) => {
    // Honeypot: silently accept obvious bot submissions without touching production data.
    if (data.website) return { accepted: true, duplicate: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const duplicateCutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();

    const existing = await supabaseAdmin
      .from("pilot_signups")
      .select("id")
      .eq("email", data.email)
      .eq("interest", data.interest)
      .gte("created_at", duplicateCutoff)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing.error) throw new Error("Pilot intake could not be checked right now.");

    const metadata = {
      async_preferred: true,
      referrer: data.referrer || null,
      authority_self_declared: data.authoritySelfDeclared,
      transport_available: data.transportAvailable,
      captured_at: new Date().toISOString(),
    };

    const leadPatch = {
      full_name: data.fullName,
      email: data.email,
      postal_code: data.postalCode || null,
      interest: data.interest,
      organization_name: data.organizationName || null,
      note: data.note || null,
      lead_source: data.leadSource,
      preferred_contact: "email_only",
      metadata,
      do_not_contact: false,
    };

    if (existing.data?.id) {
      const updated = await supabaseAdmin
        .from("pilot_signups")
        .update(leadPatch as never)
        .eq("id", existing.data.id);
      if (updated.error) throw new Error("Pilot intake could not be updated right now.");
      return { accepted: true, duplicate: true };
    }

    const inserted = await supabaseAdmin.from("pilot_signups").insert({
      ...leadPatch,
      user_id: null,
      status: "queued_manual_review",
    } as never);

    if (inserted.error) throw new Error("Pilot intake could not be submitted right now.");
    return { accepted: true, duplicate: false };
  });
