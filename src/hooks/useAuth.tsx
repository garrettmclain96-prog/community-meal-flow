import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { flushPendingAcceptances } from "@/lib/legal/acceptance";

export type AppRole =
  "household" | "kitchen" | "nonprofit" | "sponsor" | "city_admin" | "platform_admin";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setRoles([]);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user.id;
    if (!uid) return;
    let cancelled = false;
    // Acceptance captured at sign-up (before an account existed) is written now.
    void flushPendingAcceptances(uid);
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .then(({ data }) => {
        if (!cancelled) setRoles((data ?? []).map((r) => r.role as AppRole));
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      roles,
      loading,
      hasRole: (role) => roles.includes(role),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, roles, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
