import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3, HandHeart, Route as RouteIcon, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useLegalGate } from "@/hooks/useLegalGate";
import { listKitchens } from "@/lib/community";
import { BASE_DOCS, type LegalDocKey } from "@/lib/legal/registry";
import {
  AVAILABILITY_BLOCKS,
  VOLUNTEER_SKILLS,
  advanceRun,
  claimRun,
  completeShift,
  joinShift,
  leaveShift,
  listRuns,
  listSignups,
  listUpcomingShifts,
  loadMyVolunteer,
  upsertVolunteer,
  type VolunteerProfile,
} from "@/lib/volunteer";

const VOLUNTEER_DOCS: LegalDocKey[] = [...BASE_DOCS, "volunteer_waiver"];
const inputCls = "field-control";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer — Deliver, Prep and Serve with ProvisionLoop" },
      {
        name: "description",
        content:
          "Browse live local shifts and delivery runs, build a volunteer profile, and close meal fulfillment loops across Galveston County.",
      },
      { property: "og:title", content: "Volunteer — ProvisionLoop" },
      {
        property: "og:description",
        content: "Find a real shift or delivery run, claim it, complete it, and move the public outcome forward.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VolunteerPage,
});

function VolunteerPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const legal = useLegalGate({
    documents: VOLUNTEER_DOCS,
    requireSignature: true,
    context: "volunteer_activity",
    intro: "Claiming a shift or delivery run requires the signed volunteer release at its current version.",
  });

  const profile = useQuery({
    queryKey: ["volunteer", user?.id],
    enabled: Boolean(user),
    queryFn: () => loadMyVolunteer(user!.id),
  });
  const kitchens = useQuery({ queryKey: ["kitchens"], queryFn: listKitchens });
  const shifts = useQuery({ queryKey: ["shifts"], queryFn: listUpcomingShifts });
  const signups = useQuery({
    queryKey: ["signups", user?.id],
    enabled: Boolean(profile.data),
    queryFn: listSignups,
  });
  const runs = useQuery({
    queryKey: ["runs", user?.id],
    enabled: Boolean(user),
    queryFn: listRuns,
  });

  const kitchenName = useMemo(
    () => new Map((kitchens.data ?? []).map((k) => [k.id, k])),
    [kitchens.data],
  );

  const me = profile.data;
  const mySignups = (signups.data ?? []).filter((s) => s.volunteer_id === me?.id);
  const mySignupByShift = new Map(mySignups.map((s) => [s.shift_id, s]));
  const openRuns = (runs.data ?? []).filter((r) => r.status === "open");
  const myRuns = (runs.data ?? []).filter((r) => me && r.volunteer_id === me.id);
  const hours = mySignups.reduce((n, s) => n + Number(s.hours || 0), 0);
  const mealsMoved = myRuns.filter((r) => r.status === "delivered").reduce((n, r) => n + r.meals, 0);

  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["signups"] }),
      qc.invalidateQueries({ queryKey: ["runs"] }),
      qc.invalidateQueries({ queryKey: ["shifts"] }),
      qc.invalidateQueries({ queryKey: ["impact-totals"] }),
    ]);
  };

  return (
    <div className="pl-workflow-shell min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="pl-page-intro">
          <div className="site-shell">
            <p className="kicker text-primary">ProvisionLoop volunteers</p>
            <h1 className="display-title mt-5 max-w-5xl text-6xl md:text-8xl">
              DON&apos;T JUST VOLUNTEER. CLOSE A LOOP.
            </h1>
            <p className="pl-page-deck">
              Kitchens post real work they need. Prepared funded orders become delivery runs. Pick a
              job, claim it, complete it, and move the actual network outcome forward.
            </p>
            <div className="pl-stage-strip">
              <div><span>01 · Profile</span><strong>Tell us how you can help</strong></div>
              <div><span>02 · Claim</span><strong>Choose real open work</strong></div>
              <div><span>03 · Do</span><strong>Prep, carry or deliver</strong></div>
              <div><span>04 · Close</span><strong>Log hours + meals moved</strong></div>
            </div>
          </div>
        </section>

        <div className="site-shell py-14 md:py-20">
          {!user && (
            <div className="editorial-card grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div>
                <p className="kicker text-primary">Your entry point</p>
                <h2 className="mt-2 font-display text-3xl font-black">SEE THE WORK BEFORE YOU SIGN UP.</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                  Browse the live board first. Create an account only when you are ready to build a profile and claim work.
                </p>
              </div>
              <Link to="/auth" search={{ redirect: "/volunteer" }} className="button-primary">
                Sign in to volunteer
              </Link>
            </div>
          )}

          {!user && (
            <section className="mt-14">
              <p className="kicker text-primary">Open nearby</p>
              <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.05em]">BROWSE BEFORE YOU COMMIT.</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {(shifts.data ?? []).slice(0, 6).map((shift, index) => {
                  const kitchen = kitchenName.get(shift.kitchen_id);
                  return (
                    <article key={shift.id} className="editorial-card pl-number-card p-5" data-index={String(index + 1).padStart(2, "0")}>
                      <div className="relative z-[1] flex justify-between gap-3">
                        <h3 className="font-display text-lg font-black">{shift.title}</h3>
                        <span className="kicker text-primary">{shift.role}</span>
                      </div>
                      <p className="relative z-[1] mt-3 text-sm text-muted-foreground">
                        {kitchen?.name ?? "Local kitchen"} · {shift.neighborhood ?? kitchen?.neighborhood ?? "Galveston"}
                      </p>
                      <p className="relative z-[1] mt-1 text-sm font-bold">
                        {new Date(shift.starts_at).toLocaleString([], {
                          weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                    </article>
                  );
                })}
                {!shifts.isLoading && (shifts.data?.length ?? 0) === 0 && (
                  <p className="pl-trust-note">No open shifts are posted right now. New work appears as kitchens create real capacity needs.</p>
                )}
              </div>
            </section>
          )}

          {user && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Hours logged" value={hours.toFixed(1)} icon={Clock3} />
                <Stat label="Meals you delivered" value={mealsMoved.toLocaleString()} icon={Truck} />
                <Stat label="Open shifts nearby" value={String(shifts.data?.length ?? 0)} icon={HandHeart} />
                <Stat label="Runs waiting" value={String(openRuns.length)} icon={RouteIcon} />
              </div>

              {!legal.satisfied && (
                <div className="editorial-card mt-10 p-6 md:p-8">
                  <p className="kicker text-primary">Required before claiming work</p>
                  <h2 className="mt-2 font-display text-3xl font-black">SIGN ONCE. THEN MOVE.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    You can browse now. Claiming a shift or delivery run requires the current signed volunteer release.
                  </p>
                  <div className="mt-5">{legal.gate}</div>
                </div>
              )}

              <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                <VolunteerProfileForm
                  profile={me ?? null}
                  onSaved={async () => {
                    await qc.invalidateQueries({ queryKey: ["volunteer"] });
                    await qc.invalidateQueries({ queryKey: ["signups"] });
                  }}
                />

                <div className="space-y-8">
                  <div className="editorial-card p-6">
                    <div className="flex items-start gap-3">
                      <Truck className="mt-1 size-5 shrink-0 text-primary" />
                      <div>
                        <p className="kicker text-primary">Prepared → delivered</p>
                        <h2 className="mt-1 font-display text-2xl font-black">DELIVERY RUNS</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          You see the kitchen, meal count, drop-off area and window — never a household name or private address on this board.
                        </p>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-3">
                      {(runs.data ?? [])
                        .filter((r) => r.status !== "delivered" || (me && r.volunteer_id === me.id))
                        .map((r) => {
                          const k = kitchenName.get(r.kitchen_id);
                          const mine = me && r.volunteer_id === me.id;
                          return (
                            <li key={r.id} className="border border-border bg-card p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-bold">{r.meals} meals · {k?.name ?? "Kitchen"}</p>
                                <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">{r.status.replace("_", " ")}</span>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                Drop-off area: {r.dropoff_area ?? k?.neighborhood ?? "Galveston"} · window {new Date(r.window_start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–{new Date(r.window_end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {r.status === "open" && (
                                  <ActionButton label="Claim this run" onClick={async () => {
                                    if (!me) throw new Error("Save your volunteer profile first");
                                    await legal.assertAccepted();
                                    await claimRun(r.id);
                                    await refresh();
                                    toast.success("Run claimed — thank you");
                                  }} />
                                )}
                                {mine && r.status === "claimed" && (
                                  <>
                                    <ActionButton label="Picked up" onClick={async () => {
                                      await advanceRun(r.id, "picked_up");
                                      await refresh();
                                      toast.success("Marked picked up");
                                    }} />
                                    <ActionButton label="Release" subtle onClick={async () => {
                                      await advanceRun(r.id, "released");
                                      await refresh();
                                      toast.message("Released back to the board");
                                    }} />
                                  </>
                                )}
                                {mine && r.status === "picked_up" && (
                                  <ActionButton label="Delivered" onClick={async () => {
                                    await advanceRun(r.id, "delivered");
                                    await refresh();
                                    toast.success(`${r.meals} meals delivered — ledger updated`);
                                  }} />
                                )}
                              </div>
                            </li>
                          );
                        })}
                      {(runs.data?.length ?? 0) === 0 && (
                        <li className="pl-trust-note">No runs on the board. A run appears when a funded order reaches the prepared stage.</li>
                      )}
                    </ul>
                  </div>

                  <div className="editorial-card p-6">
                    <div className="flex items-start gap-3">
                      <HandHeart className="mt-1 size-5 shrink-0 text-primary" />
                      <div>
                        <p className="kicker text-primary">Kitchen-side work</p>
                        <h2 className="mt-1 font-display text-2xl font-black">OPEN KITCHEN SHIFTS</h2>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-3">
                      {(shifts.data ?? []).map((s) => {
                        const k = kitchenName.get(s.kitchen_id);
                        const signup = mySignupByShift.get(s.id);
                        return (
                          <li key={s.id} className="border border-border bg-card p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold">{s.title}</p>
                              <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">{s.role}</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {k?.name ?? "Kitchen"} · {s.neighborhood ?? k?.neighborhood ?? k?.city} · {new Date(s.starts_at).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {s.slots} slots
                            </p>
                            {s.notes && <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p>}
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              {!signup && (
                                <ActionButton label="Sign up" onClick={async () => {
                                  if (!me) throw new Error("Save your volunteer profile first");
                                  await legal.assertAccepted();
                                  await joinShift(s.id, me.id);
                                  await refresh();
                                  toast.success("You're on the roster");
                                }} />
                              )}
                              {signup && signup.status === "claimed" && (
                                <>
                                  <ActionButton label="Log completed" onClick={async () => {
                                    const h = (new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 3_600_000;
                                    await completeShift(signup.id, Math.max(0.5, Math.round(h * 2) / 2));
                                    await refresh();
                                    toast.success("Hours logged");
                                  }} />
                                  <ActionButton label="Cancel" subtle onClick={async () => {
                                    await leaveShift(signup.id);
                                    await refresh();
                                    toast.message("Signup cancelled");
                                  }} />
                                </>
                              )}
                              {signup?.status === "completed" && <span className="text-xs text-muted-foreground">Completed · {Number(signup.hours).toFixed(1)}h logged</span>}
                            </div>
                          </li>
                        );
                      })}
                      {(shifts.data?.length ?? 0) === 0 && (
                        <li className="pl-trust-note">No shifts posted yet. Kitchens create them from <Link to="/kitchen" className="font-bold underline underline-offset-4">the kitchen portal</Link>.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock3 }) {
  return (
    <div className="editorial-card p-5">
      <Icon className="size-5 text-primary" />
      <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-black">{value}</p>
    </div>
  );
}

function ActionButton({ label, onClick, subtle }: { label: string; onClick: () => Promise<void>; subtle?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await onClick(); }
        catch (err) { toast.error(err instanceof Error ? err.message : "That didn't work"); }
        finally { setBusy(false); }
      }}
      className={subtle ? "button-secondary px-3 py-1 text-xs disabled:opacity-40" : "button-primary px-3 py-1 text-xs disabled:opacity-40"}
    >
      {busy ? "Working…" : label}
    </button>
  );
}

function VolunteerProfileForm({ profile, onSaved }: { profile: VolunteerProfile | null; onSaved: () => Promise<void> }) {
  const { user } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [city, setCity] = useState(profile?.city ?? "Galveston");
  const [areas, setAreas] = useState((profile?.neighborhoods ?? []).join(", "));
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [availability, setAvailability] = useState<string[]>(profile?.availability ?? []);
  const [canDrive, setCanDrive] = useState(profile?.can_drive ?? false);
  const [agreed, setAgreed] = useState(Boolean(profile?.agreement_accepted_at));
  const [busy, setBusy] = useState(false);
  const legal = useLegalGate({
    documents: VOLUNTEER_DOCS,
    requireSignature: true,
    context: "volunteer_registration",
    intro: "Volunteering carries physical risk, so the release is signed. Acceptance is saved before your profile is created.",
  });

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please accept the volunteer agreement");
      return;
    }
    setBusy(true);
    try {
      await legal.assertAccepted();
      await upsertVolunteer(user!.id, {
        full_name: name,
        email: user!.email ?? null,
        phone: phone || null,
        city,
        neighborhoods: areas.split(",").map((s) => s.trim()).filter(Boolean),
        skills,
        availability,
        can_drive: canDrive,
        agreement_accepted_at: new Date().toISOString(),
      });
      toast.success(profile ? "Profile updated" : "You're signed up to volunteer");
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="editorial-card p-6">
      <p className="kicker text-primary">Your capability card</p>
      <h2 className="mt-2 font-display text-3xl font-black">{profile ? "YOUR VOLUNTEER PROFILE" : "BUILD YOUR VOLUNTEER PROFILE"}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">This controls what work makes sense for you. It is not a public profile.</p>
      <div className="mt-6 grid gap-4">
        <Field label="Full name"><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Field>
          <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Areas you can serve (comma separated)">
          <input value={areas} onChange={(e) => setAreas(e.target.value)} placeholder="East End, Downtown, Fish Village" className={inputCls} />
        </Field>

        <fieldset>
          <legend className="field-label">What you can do</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {VOLUNTEER_SKILLS.map((s) => <Chip key={s} label={s} active={skills.includes(s)} onClick={() => toggle(skills, setSkills, s)} />)}
          </div>
        </fieldset>

        <fieldset>
          <legend className="field-label">When you&apos;re free</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVAILABILITY_BLOCKS.map((a) => <Chip key={a} label={a} active={availability.includes(a)} onClick={() => toggle(availability, setAvailability, a)} />)}
          </div>
        </fieldset>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={canDrive} onChange={(e) => setCanDrive(e.target.checked)} className="size-5" />
          I can drive deliveries with my own vehicle
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 size-5 shrink-0" />
          <span className="text-muted-foreground">I&apos;ll keep recipient information private, handle food safely, and let the kitchen know if I can&apos;t make a shift.</span>
        </label>
      </div>

      {legal.gate && <div className="mt-6">{legal.gate}</div>}
      <button type="submit" disabled={busy || !legal.satisfied} className="button-primary mt-6 w-full disabled:opacity-60">
        {busy ? "Saving…" : profile ? "Save volunteer profile" : "Join as a volunteer"}
      </button>
    </form>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3 py-1 text-xs capitalize transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="field-label">{label}</span><div className="mt-1">{children}</div></label>;
}
