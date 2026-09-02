import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AccountButton } from "@/components/AccountButton";
import { useAuth } from "@/hooks/useAuth";
import { listKitchens } from "@/lib/community";
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

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer — Deliver, Prep and Serve with TableForward" },
      {
        name: "description",
        content:
          "Sign up to deliver funded meals, prep and cook alongside Galveston kitchens, and log the hours you give. Open shifts and delivery runs, updated live.",
      },
      { property: "og:title", content: "Volunteer — TableForward" },
      {
        property: "og:description",
        content: "Claim a delivery run or a kitchen shift near you and see exactly how many meals you moved.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VolunteerPage,
});

const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground";

function VolunteerPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

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
  const mealsMoved = myRuns
    .filter((r) => r.status === "delivered")
    .reduce((n, r) => n + r.meals, 0);

  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["signups"] }),
      qc.invalidateQueries({ queryKey: ["runs"] }),
      qc.invalidateQueries({ queryKey: ["shifts"] }),
      qc.invalidateQueries({ queryKey: ["impact-totals"] }),
    ]);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl font-bold italic tracking-tight">
            Table<span className="text-ember">Forward</span>
          </Link>
          <AccountButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ember-text">TableForward Volunteers</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold tracking-tight">
          Two hours of your week is a hundred meals on someone's table.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Kitchens post the shifts they actually need filled. Funded orders that are cooked and
          waiting become delivery runs. Claim one, carry it, close it out — the meal count on the
          public ledger moves the moment you do.
        </p>

        {!user && (
          <div className="mt-10 rounded-xl border border-border bg-surface p-6">
            <p className="text-sm text-muted-foreground">
              Create an account to build a volunteer profile, claim shifts and take delivery runs.
            </p>
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Sign in to volunteer
            </Link>
          </div>
        )}

        {user && (
          <>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Hours logged" value={hours.toFixed(1)} />
              <Stat label="Meals you delivered" value={mealsMoved.toLocaleString()} />
              <Stat label="Open shifts nearby" value={String(shifts.data?.length ?? 0)} />
              <Stat label="Runs waiting for a driver" value={String(openRuns.length)} />
            </div>

            <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <VolunteerProfileForm
                profile={me ?? null}
                onSaved={async () => {
                  await qc.invalidateQueries({ queryKey: ["volunteer"] });
                  await qc.invalidateQueries({ queryKey: ["signups"] });
                }}
              />

              <div className="space-y-8">
                <div className="rounded-xl border border-border bg-surface p-6">
                  <h2 className="font-display text-2xl font-bold">Delivery runs</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cooked and waiting. You see the kitchen and the drop-off area — never a
                    household name or address.
                  </p>
                  <ul className="mt-4 space-y-3">
                    {(runs.data ?? [])
                      .filter((r) => r.status !== "delivered" || (me && r.volunteer_id === me.id))
                      .map((r) => {
                        const k = kitchenName.get(r.kitchen_id);
                        const mine = me && r.volunteer_id === me.id;
                        return (
                          <li key={r.id} className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold">
                                {r.meals} meals · {k?.name ?? "Kitchen"}
                              </p>
                              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-widest text-ember-text">
                                {r.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Drop-off area: {r.dropoff_area ?? k?.neighborhood ?? "Galveston"} · window{" "}
                              {new Date(r.window_start).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                              –
                              {new Date(r.window_end).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {r.status === "open" && (
                                <ActionButton
                                  label="Claim this run"
                                  onClick={async () => {
                                    if (!me) throw new Error("Save your volunteer profile first");
                                    await claimRun(r.id);
                                    await refresh();
                                    toast.success("Run claimed — thank you");
                                  }}
                                />
                              )}
                              {mine && r.status === "claimed" && (
                                <>
                                  <ActionButton
                                    label="Picked up"
                                    onClick={async () => {
                                      await advanceRun(r.id, "picked_up");
                                      await refresh();
                                      toast.success("Marked picked up");
                                    }}
                                  />
                                  <ActionButton
                                    label="Release"
                                    subtle
                                    onClick={async () => {
                                      await advanceRun(r.id, "released");
                                      await refresh();
                                      toast.message("Released back to the board");
                                    }}
                                  />
                                </>
                              )}
                              {mine && r.status === "picked_up" && (
                                <ActionButton
                                  label="Delivered"
                                  onClick={async () => {
                                    await advanceRun(r.id, "delivered");
                                    await refresh();
                                    toast.success(`${r.meals} meals delivered — ledger updated`);
                                  }}
                                />
                              )}
                            </div>
                          </li>
                        );
                      })}
                    {(runs.data?.length ?? 0) === 0 && (
                      <li className="text-sm text-muted-foreground">
                        No runs on the board. A run appears the moment a kitchen marks a funded
                        order prepared.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-surface p-6">
                  <h2 className="font-display text-2xl font-bold">Open kitchen shifts</h2>
                  <ul className="mt-4 space-y-3">
                    {(shifts.data ?? []).map((s) => {
                      const k = kitchenName.get(s.kitchen_id);
                      const signup = mySignupByShift.get(s.id);
                      return (
                        <li key={s.id} className="rounded-lg border border-border bg-card p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">{s.title}</p>
                            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-widest text-ember-text">
                              {s.role}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {k?.name ?? "Kitchen"} · {s.neighborhood ?? k?.neighborhood ?? k?.city} ·{" "}
                            {new Date(s.starts_at).toLocaleString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}{" "}
                            · {s.slots} slots
                          </p>
                          {s.notes && <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p>}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {!signup && (
                              <ActionButton
                                label="Sign up"
                                onClick={async () => {
                                  if (!me) throw new Error("Save your volunteer profile first");
                                  await joinShift(s.id, me.id);
                                  await refresh();
                                  toast.success("You're on the roster");
                                }}
                              />
                            )}
                            {signup && signup.status === "claimed" && (
                              <>
                                <ActionButton
                                  label="Log completed"
                                  onClick={async () => {
                                    const h =
                                      (new Date(s.ends_at).getTime() -
                                        new Date(s.starts_at).getTime()) /
                                      3_600_000;
                                    await completeShift(signup.id, Math.max(0.5, Math.round(h * 2) / 2));
                                    await refresh();
                                    toast.success("Hours logged");
                                  }}
                                />
                                <ActionButton
                                  label="Cancel"
                                  subtle
                                  onClick={async () => {
                                    await leaveShift(signup.id);
                                    await refresh();
                                    toast.message("Signup cancelled");
                                  }}
                                />
                              </>
                            )}
                            {signup?.status === "completed" && (
                              <span className="text-xs text-muted-foreground">
                                Completed · {Number(signup.hours).toFixed(1)}h logged
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                    {(shifts.data?.length ?? 0) === 0 && (
                      <li className="text-sm text-muted-foreground">
                        No shifts posted yet. Kitchens post them from{" "}
                        <Link to="/kitchen" className="underline underline-offset-4">
                          the kitchen portal
                        </Link>
                        .
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  subtle,
}: {
  label: string;
  onClick: () => Promise<void>;
  subtle?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onClick();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "That didn't work");
        } finally {
          setBusy(false);
        }
      }}
      className={
        subtle
          ? "rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"
          : "rounded-full bg-ember px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-40"
      }
    >
      {busy ? "…" : label}
    </button>
  );
}

function VolunteerProfileForm({
  profile,
  onSaved,
}: {
  profile: VolunteerProfile | null;
  onSaved: () => Promise<void>;
}) {
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
      await upsertVolunteer(user!.id, {
        full_name: name,
        email: user!.email ?? null,
        phone: phone || null,
        city,
        neighborhoods: areas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
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
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6">
      <h2 className="font-display text-2xl font-bold">
        {profile ? "Your volunteer profile" : "Sign up to volunteer"}
      </h2>
      <div className="mt-5 grid gap-4">
        <Field label="Full name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </Field>
          <Field label="City">
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Areas you can serve (comma separated)">
          <input
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
            placeholder="East End, Downtown, Fish Village"
            className={inputCls}
          />
        </Field>

        <fieldset>
          <legend className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            What you can do
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {VOLUNTEER_SKILLS.map((s) => (
              <Chip
                key={s}
                label={s}
                active={skills.includes(s)}
                onClick={() => toggle(skills, setSkills, s)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            When you're free
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVAILABILITY_BLOCKS.map((a) => (
              <Chip
                key={a}
                label={a}
                active={availability.includes(a)}
                onClick={() => toggle(availability, setAvailability, a)}
              />
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={canDrive}
            onChange={(e) => setCanDrive(e.target.checked)}
            className="h-4 w-4"
          />
          I can drive deliveries with my own vehicle
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-muted-foreground">
            I'll keep recipient information private, handle food safely, and let the kitchen know if
            I can't make a shift.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Saving…" : profile ? "Save profile" : "Join as a volunteer"}
      </button>
    </form>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
        active
          ? "border-ember bg-ember text-primary-foreground"
          : "border-border text-muted-foreground hover:border-ember/50"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
