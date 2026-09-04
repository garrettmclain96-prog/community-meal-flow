import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import {
  EMPTY_ACCEPTANCE,
  LegalAcceptance,
  isAcceptanceComplete,
  type LegalAcceptanceValue,
} from "@/components/LegalAcceptance";
import { queuePendingAcceptance } from "@/lib/legal/acceptance";
import { BASE_DOCS } from "@/lib/legal/registry";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : "/app",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — ProvisionLoop" },
      {
        name: "description",
        content:
          "Sign in to ProvisionLoop to plan household meals with MealForge, fund meals, run a community kitchen, or track city food impact.",
      },
      { property: "og:title", content: "Sign in — ProvisionLoop" },
      {
        property: "og:description",
        content: "One account for MealForge households, sponsors, kitchens, nonprofits and cities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const ROLES: Array<{ id: AppRole; label: string; blurb: string }> = [
  { id: "household", label: "Household", blurb: "Plan meals and shop to a budget with MealForge" },
  { id: "sponsor", label: "Sponsor / donor", blurb: "Fund meals and follow where they land" },
  { id: "kitchen", label: "Kitchen", blurb: "Restaurant, food truck or community kitchen" },
  { id: "nonprofit", label: "Nonprofit partner", blurb: "Route demand and verify fulfilment" },
  {
    id: "city_admin",
    label: "City / public sector",
    blurb: "Neighborhood-level food security signal",
  },
];

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AppRole>("household");
  const [busy, setBusy] = useState(false);
  const [legal, setLegal] = useState<LegalAcceptanceValue>(EMPTY_ACCEPTANCE);
  const legalReady = isAcceptanceComplete(legal, false);

  useEffect(() => {
    if (!loading && session) void navigate({ to: redirect, replace: true });
  }, [loading, session, navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !legalReady) {
      toast.error("Please accept the Terms of Service v1.0 and Privacy Policy v1.0 to continue.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        // Queued now, written to the account by the post-authentication flush.
        queuePendingAcceptance({ keys: BASE_DOCS, context: "account_signup" });
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { role, display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. If a confirmation email arrives, confirm to finish.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in unavailable");
    }
  }

  return (
    <main className="min-h-dvh bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          ← ProvisionLoop
        </Link>
        <h1 className="mt-6 font-display text-3xl text-foreground">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One account across MealForge, Impact, Kitchen, Partner and Civic.
        </p>

        <button
          type="button"
          onClick={google}
          className="mt-7 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or email{" "}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Name
                </span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
                  placeholder="Alex Rivera"
                />
              </label>
              <fieldset>
                <legend className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  I am a…
                </legend>
                <div className="mt-2 grid gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      aria-pressed={role === r.id}
                      className={`rounded-lg border px-3 py-2.5 text-left transition ${
                        role === r.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      <div className="text-sm font-medium text-foreground">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.blurb}</div>
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 text-sm text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
