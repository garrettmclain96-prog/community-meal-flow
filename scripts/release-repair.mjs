import { readFileSync, writeFileSync } from "node:fs";

const serverFiles = [
  "src/lib/chatgpt.functions.ts",
  "src/lib/food/import.functions.ts",
  "src/lib/payments.functions.ts",
];

for (const file of serverFiles) {
  const before = readFileSync(file, "utf8");
  const after = before.replaceAll(".validator(", ".inputValidator(");
  if (after !== before) {
    writeFileSync(file, after);
    console.log(`Repaired legacy TanStack validators in ${file}`);
  }
}

const homepage = "src/routes/index.tsx";
const before = readFileSync(homepage, "utf8");
if (!before.includes("THE GAP ISN&apos;T GENEROSITY. IT&apos;S COORDINATION.")) {
  const marker = '        <section className="pl-section pl-proof-section">';
  const teaser = `        <section className="pl-section border-b-2 border-foreground">
          <div className="site-shell grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <p className="pl-section-kicker">Why ProvisionLoop?</p>
              <h2 className="pl-section-title">THE GAP ISN&apos;T GENEROSITY. IT&apos;S COORDINATION.</h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-sm leading-7 opacity-70 md:text-base">
                Communities already have people willing to help, kitchens with usable capacity,
                organizations that understand local need and volunteers willing to move food. The
                failure point is what happens between those pieces. ProvisionLoop connects them into
                one accountable loop.
              </p>
              <Link
                to="/about"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary"
              >
                Why ProvisionLoop exists <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

`;

  if (!before.includes(marker)) {
    throw new Error("Homepage insertion marker not found");
  }
  writeFileSync(homepage, before.replace(marker, teaser + marker));
  console.log("Added Why ProvisionLoop teaser to homepage");
}
