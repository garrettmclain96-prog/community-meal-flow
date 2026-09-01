import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { STORES } from "@/lib/food/pricing";
import { useMealForge } from "@/lib/food/store";
import type { Allergen, DietTag, HouseholdMember } from "@/lib/food/types";

export const Route = createFileRoute("/app/setup")({
  head: () => ({
    meta: [
      { title: "Household Setup — MealForge" },
      {
        name: "description",
        content:
          "Set household members, allergies, avoided ingredients, equipment, preferred store and weekly grocery budget. Every plan is built against these constraints.",
      },
      { property: "og:title", content: "Household Setup — MealForge" },
      {
        property: "og:description",
        content: "Members, allergies, equipment, store and weekly budget — the constraints behind every plan.",
      },
    ],
  }),
  component: SetupPage,
});

const ALLERGENS: Allergen[] = [
  "milk", "egg", "peanut", "tree_nut", "soy", "wheat", "fish", "shellfish", "sesame",
];
const AVOID: DietTag[] = ["meat", "poultry", "pork", "beef", "fish", "shellfish", "dairy", "egg", "gluten", "alcohol"];
const EQUIPMENT = ["oven", "skillet", "pot", "sheet pan", "slow cooker", "grill", "blender", "air fryer"];

function label(v: string) {
  return v.replace(/_/g, " ");
}

function SetupPage() {
  const { state, ready, setHousehold, update, regeneratePlan } = useMealForge();
  const navigate = useNavigate();
  const [form, setForm] = useState(state.household);

  useEffect(() => {
    if (ready) setForm(state.household);
  }, [ready, state.household]);

  if (!ready) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const setMembers = (n: number) => {
    const members: HouseholdMember[] = Array.from({ length: n }, (_, i) => {
      const existing = form.members[i];
      return (
        existing ?? {
          id: `m${i + 1}`,
          name: `Person ${i + 1}`,
          ageGroup: "adult" as const,
          appetite: 1,
        }
      );
    });
    setForm({ ...form, members });
  };

  const toggle = <T extends string>(list: T[], v: T): T[] =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const save = () => {
    setHousehold(form);
    update({ onboarded: true });
    // plan rebuilds from the saved household on the Plan screen
    setTimeout(() => regeneratePlan(), 0);
    navigate({ to: "/app/plan" });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Household</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These are hard constraints, not preferences the planner can ignore.
        </p>
      </header>

      <Field label="Household name">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="People">
          <input
            type="number"
            min={1}
            max={12}
            value={form.members.length}
            onChange={(e) => setMembers(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Dinners per week">
          <input
            type="number"
            min={1}
            max={7}
            value={form.dinnersPerWeek}
            onChange={(e) =>
              setForm({ ...form, dinnersPerWeek: Math.max(1, Math.min(7, Number(e.target.value) || 1)) })
            }
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Weekly budget (USD)">
          <input
            type="number"
            min={10}
            step={5}
            value={form.weeklyBudget}
            onChange={(e) => setForm({ ...form, weeklyBudget: Number(e.target.value) || 0 })}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label="Who eats">
        <ul className="space-y-2">
          {form.members.map((m, i) => (
            <li key={m.id} className="flex gap-2">
              <input
                value={m.name}
                onChange={(e) => {
                  const members = [...form.members];
                  members[i] = { ...m, name: e.target.value };
                  setForm({ ...form, members });
                }}
                className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                value={m.ageGroup}
                onChange={(e) => {
                  const ageGroup = e.target.value as HouseholdMember["ageGroup"];
                  const appetite = ageGroup === "child" ? 0.6 : ageGroup === "teen" ? 1.2 : 1;
                  const members = [...form.members];
                  members[i] = { ...m, ageGroup, appetite };
                  setForm({ ...form, members });
                }}
                className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="adult">Adult</option>
                <option value="teen">Teen</option>
                <option value="child">Child</option>
              </select>
            </li>
          ))}
        </ul>
      </Field>

      <Field label="Allergies (excluded outright)">
        <Chips
          options={ALLERGENS}
          selected={form.allergies}
          onToggle={(v) => setForm({ ...form, allergies: toggle(form.allergies, v) })}
        />
      </Field>

      <Field label="Avoid">
        <Chips
          options={AVOID}
          selected={form.avoidTags}
          onToggle={(v) => setForm({ ...form, avoidTags: toggle(form.avoidTags, v) })}
        />
      </Field>

      <Field label="Equipment">
        <Chips
          options={EQUIPMENT}
          selected={form.equipment}
          onToggle={(v) => setForm({ ...form, equipment: toggle(form.equipment, v) })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preferred store">
          <select
            value={form.storeIds[0] ?? "heb"}
            onChange={(e) => setForm({ ...form, storeIds: [e.target.value] })}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
          >
            {STORES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Max cook time (minutes)">
          <input
            type="number"
            min={10}
            step={5}
            value={form.maxCookMinutes}
            onChange={(e) => setForm({ ...form, maxCookMinutes: Number(e.target.value) || 60 })}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <button
        onClick={save}
        className="w-full rounded-sm bg-ember px-5 py-3 text-sm font-semibold text-primary-foreground"
      >
        Save household and build my week
      </button>
    </div>
  );
}

function Field({ label: l, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">{l}</p>
      {children}
    </div>
  );
}

function Chips<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              on
                ? "border-ember bg-ember/10 text-ember-text"
                : "border-border text-muted-foreground hover:border-ember/40"
            }`}
          >
            {label(o)}
          </button>
        );
      })}
    </div>
  );
}
