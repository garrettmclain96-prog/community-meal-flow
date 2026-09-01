import { createFileRoute } from "@tanstack/react-router";

import { PortalPage } from "@/components/PortalPage";

export const Route = createFileRoute("/civic")({
  head: () => ({
    meta: [
      { title: "City Dashboard — TableForward Civic" },
      {
        name: "description",
        content:
          "Cities see aggregate food demand, kitchen capacity and funding gaps by neighborhood, with privacy-preserving cohort thresholds and disaster-response readiness.",
      },
      { property: "og:title", content: "City Dashboard — TableForward Civic" },
      {
        property: "og:description",
        content: "Aggregate demand, kitchen capacity and funding gaps by neighborhood — never individual households.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CivicPage,
});

function CivicPage() {
  const totals = useQuery({ queryKey: ["impact-totals"], queryFn: loadImpactTotals });
  const live = totals.data;

  return (
    <PortalPage
      eyebrow="TableForward Civic"
      title="Demand, capacity and funding gap — by neighborhood, never by household."
      lede="Civic reads only aggregates computed with minimum-cohort thresholds. If a neighborhood is too small to anonymize, it is suppressed rather than shown. No individual household appears on a public map, ever."
      stats={[
        {
          label: "Neighborhoods with funded meals",
          value: String(live?.neighborhoods.length ?? 0),
          note: "live ledger read",
          sample: false,
        },
        {
          label: "Meals funded",
          value: (live?.mealsFunded ?? 0).toLocaleString(),
          note: "live ledger read",
          sample: false,
        },
        {
          label: "Meals delivered",
          value: (live?.mealsDelivered ?? 0).toLocaleString(),
          note: "live ledger read",
          sample: false,
        },
        {
          label: "Awaiting delivery",
          value: Math.max(0, (live?.mealsFunded ?? 0) - (live?.mealsDelivered ?? 0)).toLocaleString(),
          note: "live ledger read",
          sample: false,
        },
      ]}
      capabilities={[
        { h: "Aggregate demand", body: "Privacy-preserving demand signals derived from planning activity and partner intake." },
        { h: "Capacity matching", body: "Where kitchens can absorb more, and where the network is short." },
        { h: "Funding gap analysis", body: "The dollar distance between demand and committed sponsorship, by area." },
        { h: "Disaster response", body: "Surge routing that reuses the same capacity and dispatch infrastructure." },
      ]}
      status="Neighborhood totals below are live ledger reads. Demand forecasting and cohort-suppressed intake views arrive with nonprofit intake data; nothing here exposes a household."
    >
      <section className="mt-14">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Funded meals by neighborhood
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(live?.neighborhoods ?? []).map((n) => (
            <li
              key={n.neighborhood}
              className="flex justify-between rounded-lg border border-border bg-surface px-5 py-3 text-sm"
            >
              <span>{n.neighborhood}</span>
              <span className="font-semibold">{n.meals.toLocaleString()} meals</span>
            </li>
          ))}
          {(live?.neighborhoods.length ?? 0) === 0 && (
            <li className="text-sm text-muted-foreground">
              No funded meals recorded yet in this city.
            </li>
          )}
        </ul>
      </section>
    </PortalPage>
  );
}

