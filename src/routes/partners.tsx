import { createFileRoute } from "@tanstack/react-router";

import { PortalPage } from "@/components/PortalPage";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partner With Us — TableForward Partner" },
      {
        name: "description",
        content:
          "Verified nonprofits and food-distribution organizations route verified demand, manage eligibility and referrals, and confirm fulfillment for funded meals.",
      },
      { property: "og:title", content: "Partner With Us — TableForward Partner" },
      {
        property: "og:description",
        content: "Route verified demand, manage referrals and confirm fulfillment for funded meals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PortalPage
      eyebrow="TableForward Partner"
      title="Verified demand, routed by the organizations who already know the need."
      lede="Nonprofits are the trust layer. Households are never publicly listed, sponsors never see recipients, and every dispatch closes with a fulfillment verification signed by the distributing partner."
      stats={[
        { label: "Verified partners", value: "22" },
        { label: "Households served", value: "1,940" },
        { label: "Fulfillment verified", value: "97.4%" },
        { label: "Avg. referral time", value: "1.8 days" },
      ]}
      capabilities={[
        { h: "Eligibility and referrals", body: "Program eligibility is assessed by the partner, not by an algorithm or a sponsor." },
        { h: "Demand intake", body: "Verified household and community demand enters the network through your organization." },
        { h: "Dispatch management", body: "Route funded meals and grocery assistance to the right kitchen, area and window." },
        { h: "Outcome reporting", body: "Aggregate reporting for funders that never discloses recipient identity." },
      ]}
      status="Partner verification, service areas, dispatches and fulfillment verification are defined in the shared schema and are built after households and kitchens, per the staged plan. Figures shown here are sample data."
    />
  ),
});
