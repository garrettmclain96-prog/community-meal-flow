import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";

const ROLE_LABEL: Record<string, string> = {
  household: "Household",
  sponsor: "Sponsor",
  kitchen: "Kitchen",
  nonprofit: "Partner",
  city_admin: "City",
  platform_admin: "Admin",
};

/** Session-aware sign-in affordance. Shown in every product surface header. */
export function AccountButton() {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (loading) return <span className="text-xs text-muted-foreground">…</span>;

  if (!user) {
    return (
      <Link
        to="/auth"
        search={{ redirect: "/" }}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
      >
        Sign in
      </Link>
    );
  }

  const role = roles[0] ? ROLE_LABEL[roles[0]] : null;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", search: { redirect: "/" }, replace: true });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {user.email}
        {role && <span className="ml-2 text-ember-text">{role}</span>}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
      >
        Sign out
      </button>
    </div>
  );
}
