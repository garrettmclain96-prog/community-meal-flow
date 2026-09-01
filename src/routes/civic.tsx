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
  component: () => (
    <PortalPage
      eyebrow="TableForward Civic"
      title="Demand, capacity and funding gap — by neighborhood, never by household."
      lede="Civic reads only aggregates computed with minimum-cohort thresholds. If a neighborhood is too small to anonymize, it is suppressed rather than shown. No individual household appears on a public map, ever."
      stats={[
        { label: "Neighborhoods covered", value: "31" },
        { label: "Weekly demand signal", value: "8,400 meals" },
        { label: "Kitchen capacity", value: "6,100 meals" },
        { label: "Unfunded gap", value: "2,300 meals" },
      ]}
      capabilities={[
        { h: "Aggregate demand", body: "Privacy-preserving demand signals derived from planning activity and partner intake." },
        { h: "Capacity matching", body: "Where kitchens can absorb more, and where the network is short." },
        { h: "Funding gap analysis", body: "The dollar distance between demand and committed sponsorship, by area." },
        { h: "Disaster response", body: "Surge routing that reuses the same capacity and dispatch infrastructure." },
      ]}
      status="Civic aggregates are computed from database views with cohort thresholds once the platform database is provisioned. The numbers on this page are sample data and are labeled as such until those views are live."
    />
  ),
});
