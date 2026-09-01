import { createFileRoute } from "@tanstack/react-router";

import { PortalPage } from "@/components/PortalPage";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Join as a Kitchen — TableForward Kitchen" },
      {
        name: "description",
        content:
          "Restaurants, food trucks, caterers, churches and community kitchens post capacity, receive funded orders, and stabilize revenue through predictable community meal programs.",
      },
      { property: "og:title", content: "Join as a Kitchen — TableForward Kitchen" },
      {
        property: "og:description",
        content: "Post capacity, receive funded orders, stabilize revenue through community meals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PortalPage
      eyebrow="TableForward Kitchen"
      title="Turn slow hours into funded, predictable production."
      lede="Kitchens publish real capacity and cost, and receive funded orders against it. The same optimizer that plans a household week scales community meal templates to batch production, so cost per meal is computed, not negotiated."
      stats={[
        { label: "Participating kitchens", value: "64" },
        { label: "Funded meals / week", value: "3,120" },
        { label: "Avg. payout latency", value: "48 hrs" },
        { label: "Revenue stabilized", value: "$41,700" },
      ]}
      capabilities={[
        { h: "Capacity and schedules", body: "Declare covers, production windows, equipment and delivery radius." },
        { h: "Community meal templates", body: "Batch-scaled recipes costed on the same ingredient graph households use." },
        { h: "Funded orders and payouts", body: "Sponsored orders arrive as committed revenue with a payout schedule attached." },
        { h: "Impact history", body: "Every fulfilled dispatch becomes a verifiable record you can show your community." },
      ]}
      status="Kitchen onboarding, capacity and payout tables are reserved in the shared schema and build after the household workflow is complete, exactly as staged. The batch-scaling optimizer is the same module already powering MealForge planning."
    />
  ),
});
