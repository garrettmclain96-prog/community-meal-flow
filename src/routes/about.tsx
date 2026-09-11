import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  LockKeyhole,
  ReceiptText,
  UtensilsCrossed,
} from "lucide-react";

import "@/about-experience.css";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Why ProvisionLoop Exists — Good Intentions Need Execution" },
      {
        name: "description",
        content:
          "ProvisionLoop exists because food, willing kitchens, funding and volunteers can all exist at the same time while somebody still goes hungry. Garrett McLain built it to close that execution gap.",
      },
      { property: "og:title", content: "ProvisionLoop — Good intentions are not enough. Execution matters." },
      {
        property: "og:description",
        content:
          "The movement is simple: if help never reaches the other end, the job is not finished.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  {
    icon: LockKeyhole,
    title: "Protect the person",
    body: "Need enters privately. Somebody asking for dinner does not owe the internet their hardship in exchange for help.",
  },
  {
    icon: UtensilsCrossed,
    title: "Use real capacity",
    body: "A kitchen counts when its status is known and it can actually fulfill. A directory listing is not the same thing as a partner.",
  },
  {
    icon: ReceiptText,
    title: "Prove the handoff",
    body: "Funding is not the finish line. The loop closes when the meal reaches the other end and the outcome is recorded honestly.",
  },
] as const;

function AboutPage() {
  return (
    <div className="pl-about min-h-dvh text-foreground">
      <SiteHeader />
      <main>
        <section className="pl-about-hero">
          <div className="site-shell">
            <p className="kicker text-primary">Why ProvisionLoop exists</p>
            <h1 className="pl-about-title">
              GOOD INTENTIONS <span>STILL FAIL.</span>
            </h1>
            <p className="pl-about-lead">
              The food can exist. The kitchen can exist. The money can exist. The volunteer can exist.
              And somebody can still go hungry because none of those pieces are responsible for the
              handoff between them. ProvisionLoop exists to make the handoff the job.
            </p>

            <div className="pl-about-sequence" aria-label="ProvisionLoop operating sequence">
              <div><span>01 · Need</span><strong>Keep it private</strong></div>
              <div><span>02 · Capacity</span><strong>Verify it</strong></div>
              <div><span>03 · Action</span><strong>Move money + people</strong></div>
              <div><span>04 · Proof</span><strong>Show it closed</strong></div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="site-shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="kicker text-primary">The failure Garrett refused to accept</p>
              <h2 className="mt-4 max-w-[11ch] font-display text-4xl font-black tracking-[-0.055em] md:text-6xl">
                CARING ISN&apos;T A DELIVERY SYSTEM.
              </h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-muted-foreground md:text-lg">
              <p>
                The frustrating part was not a shortage of people who cared. It was seeing useful
                things sitting next to each other without becoming an outcome: kitchens with spare
                capacity, people ready to help, money ready to move and households that still needed food.
              </p>
              <p>
                Between those pieces was a gap nobody owned. A message waited. A handoff died. A list
                went stale. A donation became a receipt instead of dinner. Everybody could mean well
                and the system could still fail.
              </p>
              <p className="font-semibold text-foreground">
                ProvisionLoop was built around one refusal: good intentions do not get credit for an outcome they never completed.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-foreground py-16 text-background md:py-24">
          <div className="site-shell">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The movement</p>
            <h2 className="mt-5 max-w-5xl font-display text-5xl font-black leading-[0.86] tracking-[-0.065em] md:text-8xl">
              IF HELP NEVER REACHES THE OTHER END, THE JOB IS NOT FINISHED.
            </h2>
            <p className="mt-8 max-w-3xl text-base leading-8 text-[#b8b2a7] md:text-lg">
              ProvisionLoop is the system underneath that belief. The movement is bigger and simpler:
              stop celebrating intent before the handoff is complete. Count what actually closed.
            </p>
            <div className="mt-12 grid gap-px bg-white/20 md:grid-cols-3">
              {PRINCIPLES.map(({ icon: Icon, title, body }) => (
                <article key={title} className="bg-foreground p-6 md:p-8">
                  <Icon className="size-7 text-primary" />
                  <h3 className="mt-6 font-display text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#b8b2a7]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="founder" className="pl-founder scroll-mt-32">
          <div className="site-shell px-0 sm:px-6 lg:px-8">
            <div className="pl-founder-grid">
              <div className="pl-founder-mark" aria-label="Garrett McLain founder mark">
                <span className="pl-founder-initials">GM</span>
              </div>
              <div className="pl-founder-copy">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Founder · Garrett McLain</p>
                <h2 className="pl-founder-quote">I WON&apos;T LET GOOD INTENTIONS FAIL AT EXECUTION.</h2>
                <div className="pl-founder-body space-y-5">
                  <p>
                    Garrett built ProvisionLoop because the part that bothered him was never the lack
                    of ideas. It was watching good ideas die in the last mile between somebody saying
                    they would help and somebody actually receiving help.
                  </p>
                  <p>
                    His instinct is operational: find the point where the handoff breaks, make that
                    point visible, assign responsibility to it and keep following the work until the
                    outcome is real. ProvisionLoop applies that obsession to local food coordination.
                  </p>
                  <p className="font-semibold text-white">
                    The standard is deliberately unforgiving: no fake reach, no projected impact passed
                    off as proof, no claiming a loop closed because money moved. A completed outcome is
                    the unit that counts.
                  </p>
                </div>
                <div className="pl-founder-meta">
                  <span className="pl-founder-chip">Execution first</span>
                  <span className="pl-founder-chip">Proof over theater</span>
                  <span className="pl-founder-chip">Galveston County</span>
                  <span className="pl-founder-chip">Built in public</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="site-shell grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div>
              <p className="kicker text-primary">Movement vs. system</p>
              <h2 className="mt-4 max-w-[11ch] font-display text-4xl font-black tracking-[-0.055em] md:text-6xl">
                THE BELIEF IS SIMPLE. THE MACHINERY IS NOT.
              </h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-muted-foreground md:text-base">
              <p>
                The movement says the outcome matters more than the announcement. The system handles
                the ugly details required to make that true: status, eligibility, privacy, funding,
                kitchen operations, delivery state and public aggregate proof.
              </p>
              <p>
                That machinery should stay visible enough to audit and quiet enough that a person who
                needs food does not have to understand it before asking for help.
              </p>
              <Link to="/trust-method" className="inline-flex items-center gap-2 font-black text-primary">
                Inspect the method <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="pl-about-manifesto">
          <div className="site-shell grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] opacity-70">The standard</p>
              <h2 className="mt-4">NO OUTCOME. NO CREDIT.</h2>
            </div>
            <div>
              <p>
                ProvisionLoop is still a pilot. That means the public numbers stay small until the
                work earns bigger ones. Every closed loop should be real, attributable to recorded
                activity and explainable without inventing a success story.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/impact" className="button-secondary border-current">
                  Fund the next loop <ArrowUpRight className="size-4" />
                </Link>
                <Link to="/civic" className="button-secondary border-current">
                  See the proof <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
