import { createServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";

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

    const metadata = {
      async_preferred: true,
      referrer: data.referrer || null,
      authority_self_declared: data.authoritySelfDeclared,
      transport_available: data.transportAvailable,
      captured_at: new Date().toISOString(),
    };

    // The browser/server only needs the publishable Supabase key. The narrowly
    // scoped SECURITY DEFINER RPC owns validation, de-duplication and INSERT.
    // No anonymous direct INSERT privilege is granted on pilot_signups.
    const { data: result, error } = await supabase.rpc(
      "submit_public_pilot_lead" as never,
      {
        _full_name: data.fullName,
        _email: data.email,
        _postal_code: data.postalCode || "",
        _interest: data.interest,
        _organization_name: data.organizationName || "",
        _note: data.note || "",
        _lead_source: data.leadSource,
        _metadata: metadata,
      } as never,
    );

    if (error) throw new Error("Pilot intake could not be submitted right now.");
    const payload = result as unknown as { accepted?: boolean; duplicate?: boolean } | null;
    if (!payload?.accepted) throw new Error("Pilot intake could not be confirmed right now.");

    return { accepted: true, duplicate: payload.duplicate === true };
  });
