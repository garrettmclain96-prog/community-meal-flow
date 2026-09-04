import { Link } from "@tanstack/react-router";

import { PROVIDER_STATE_LABEL, type ProviderState } from "@/lib/community";

const TONE: Record<ProviderState, string> = {
  directory: "border-border-strong text-muted-foreground",
  verified: "border-primary/60 text-primary",
  funding_enabled: "border-primary bg-primary/10 text-primary",
};

/**
 * Honest network state. A directory listing is a real local program we mapped;
 * it has not partnered with ProvisionLoop and cannot receive funding.
 */
export function ProviderStateBadge({
  state,
  className = "",
}: {
  state: ProviderState;
  className?: string;
}) {
  return (
    <span
      className={`kicker inline-flex shrink-0 items-center border px-2 py-1 text-[10px] ${TONE[state]} ${className}`}
    >
      {PROVIDER_STATE_LABEL[state]}
    </span>
  );
}

/** Compact transparency link to place beside funding decisions. */
export function TrustLink({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/trust-method"
      className={`inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4 ${className}`}
    >
      How we verify providers &amp; count impact
    </Link>
  );
}
