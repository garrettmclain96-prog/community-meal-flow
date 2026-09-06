import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDesignDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "platform_admin",
    });
    if (error) throw new Error("Unable to verify administrator access. Please retry.");
    if (data !== true) return { authorized: false as const, docs: [] };
    const { loadDesignDocs } = await import("./design-docs");
    return { authorized: true as const, docs: loadDesignDocs() };
  });
