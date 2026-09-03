import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { submitAssistanceRequest } from "@/lib/assistance";
import { listKitchens } from "@/lib/community";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Find Food Help — ProvisionLoop Galveston" },
      {
        name: "description",
        content:
          "Find participating Galveston County food programs or privately request help from the ProvisionLoop partner network.",
      },
    ],
  }),
  component: HelpPage,
});

const NEEDS = [
  ["meal_today", "A prepared meal"],
  ["groceries", "Groceries"],
  ["ongoing_meals", "Ongoing meal help"],
  ["senior_support", "Senior support"],
  ["child_support", "Child or family support"],
  ["disaster", "Disaster support"],
] as const;

function HelpPage() {
  const programs = useQuery({ queryKey: ["public-kitchens"], queryFn: listKitchens });
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phone: "",
    area: "Galveston",
    householdSize: 1,
    needType: "meal_today",
    urgency: "today",
    notes: "",
    consent: false,
  });
  const filtered = useMemo(
    () =>
      (programs.data ?? []).filter((item) =>
        `${item.name} ${item.city} ${item.neighborhood} ${item.summary}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [programs.data, query],
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const id = await submitAssistanceRequest(form);
      setSent(id);
      toast.success("Your private request was received");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b-2 border-foreground bg-secondary text-secondary-foreground">
          <div className="site-shell py-16 md:py-24">
            <p className="kicker">Food support · Galveston County</p>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              ASKING FOR FOOD SHOULD NOT BE A MAZE.
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-semibold leading-8">
              Search participating programs directly or send one private request to the partner
              network. Your name and contact information never appear publicly.
            </p>
          </div>
        </section>

        <section className="site-shell grid gap-12 py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="kicker text-primary">Nearby programs</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight">
              Start with a local door.
            </h2>
            <label className="mt-7 block">
              <span className="field-label">Search by program, city or neighborhood</span>
              <input
                className="field-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Galveston, La Marque, Fish Village…"
              />
            </label>
            <div className="mt-6 grid gap-3">
              {filtered.map((program) => (
                <article key={program.id} className="editorial-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-black">{program.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-4" />{" "}
                        {program.address ||
                          [program.neighborhood, program.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <span className="kicker border border-border-strong px-2 py-1">
                      {program.claimed ? "Operator verified" : "Directory listing"}
                    </span>
                  </div>
                  {program.summary && (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {program.summary}
                    </p>
                  )}
                  {program.website && (
                    <a
                      className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-primary"
                      href={program.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Program website <ExternalLink className="size-4" />
                    </a>
                  )}
                </article>
              ))}
              {programs.isLoading && (
                <p className="text-sm text-muted-foreground">Loading local programs…</p>
              )}
              {!programs.isLoading && filtered.length === 0 && (
                <p className="border border-border p-5 text-sm text-muted-foreground">
                  No matching listing yet. Use the private request form so a partner can help route
                  you.
                </p>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="editorial-card p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center bg-primary text-primary-foreground">
                  <PhoneCall className="size-5" />
                </div>
                <div>
                  <p className="kicker text-primary">Private request</p>
                  <h2 className="font-display text-2xl font-black">
                    Tell the network what you need.
                  </h2>
                </div>
              </div>
              {sent ? (
                <div className="mt-8 border-2 border-foreground bg-accent p-6">
                  <ShieldCheck className="size-8" />
                  <h3 className="mt-4 font-display text-2xl font-black">Request received.</h3>
                  <p className="mt-2 text-sm leading-6">
                    A verified operator can now review and route it. Keep this reference:{" "}
                    <strong>{sent.slice(0, 8).toUpperCase()}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-8 grid gap-5">
                  <Field label="First name">
                    <input
                      required
                      className="field-control"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      autoComplete="given-name"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone">
                      <input
                        className="field-control"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        className="field-control"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        autoComplete="email"
                      />
                    </Field>
                  </div>
                  <p className="-mt-3 text-xs text-muted-foreground">
                    Provide at least one way to contact you.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Area">
                      <input
                        required
                        className="field-control"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                      />
                    </Field>
                    <Field label="People needing food">
                      <input
                        required
                        className="field-control"
                        type="number"
                        min={1}
                        max={30}
                        value={form.householdSize}
                        onChange={(e) =>
                          setForm({ ...form, householdSize: Number(e.target.value) })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="What would help most?">
                    <select
                      className="field-control"
                      value={form.needType}
                      onChange={(e) => setForm({ ...form, needType: e.target.value })}
                    >
                      {NEEDS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="When is help needed?">
                    <select
                      className="field-control"
                      value={form.urgency}
                      onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    >
                      <option value="today">Today</option>
                      <option value="soon">Within a few days</option>
                      <option value="planning">Planning ahead</option>
                    </select>
                  </Field>
                  <Field label="Anything the partner should know? (optional)">
                    <textarea
                      className="field-control min-h-24"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </Field>
                  <label className="flex items-start gap-3 text-sm leading-6">
                    <input
                      required
                      type="checkbox"
                      className="mt-1 size-5"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                    />
                    <span>
                      I consent to ProvisionLoop sharing this request with a verified local partner
                      for the purpose of connecting me with food support.
                    </span>
                  </label>
                  <button
                    disabled={busy}
                    className="button-primary w-full py-4 disabled:opacity-60"
                  >
                    {busy ? "Sending privately…" : "Send private request"}
                  </button>
                  <p className="text-xs leading-5 text-muted-foreground">
                    This is not emergency service. If someone is in immediate danger, call 911. For
                    broader local resources, call 211.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
