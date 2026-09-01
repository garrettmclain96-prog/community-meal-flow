import { createFileRoute } from "@tanstack/react-router";

import { PortalPage } from "@/components/PortalPage";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Fund Meals — TableForward Impact" },
      {
        name: "description",
        content:
          "Sponsors and donors fund meals, neighborhoods and grocery assistance pools, and see transparent allocation with verified outcomes — never recipient identity.",
      },
      { property: "og:title", content: "Fund Meals — TableForward Impact" },
      {
        property: "og:description",
        content: "Fund meals and grocery assistance with transparent allocation and verified outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PortalPage
      eyebrow="TableForward Impact"
      title="Fund meals with an audit trail attached to every dollar."
      lede="Impact is where donors, sponsors and businesses commit funding, and where allocation is proven rather than asserted. Sponsors see outcomes and aggregate impact; they never see who received a meal."
      stats={[
        { label: "Meals funded", value: "12,480", note: "projection model, not a ledger read" },
        { label: "Active sponsors", value: "38" },
        { label: "Assistance pool", value: "$24,900" },
        { label: "Allocation latency", value: "< 4 hrs" },
      ]}
      capabilities={[
        { h: "One-off and recurring funding", body: "Fund a meal, a week, a neighborhood or a school, once or on a schedule." },
        { h: "Grocery assistance pools", body: "Household budget gaps produced by MealForge planning are matched against pooled funds." },
        { h: "Transparent allocation", body: "Every commitment resolves to a dispatch, a kitchen and a verified fulfillment record." },
        { h: "Impact reporting", body: "Aggregate outcomes by neighborhood and program, with cohort thresholds that keep individuals unidentifiable." },
      ]}
      status="Funding, allocation and verification tables are specified in the shared schema and land as soon as the platform database is provisioned. Until then every figure on this page is explicitly marked as sample or projected — nothing here is presented as a real ledger read."
    />
  ),
});
