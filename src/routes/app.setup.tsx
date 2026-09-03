import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
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
          "Build a meal plan around the people, budget, dietary needs and equipment in your home.",
      },
    ],
  }),
  component: SetupPage,
});

const ALLERGENS: Allergen[] = [
  "milk",
  "egg",
  "peanut",
  "tree_nut",
  "soy",
  "wheat",
  "fish",
  "shellfish",
  "sesame",
];
const AVOID: DietTag[] = [
  "meat",
  "poultry",
  "pork",
  "beef",
  "fish",
  "shellfish",
  "dairy",
  "egg",
  "gluten",
  "alcohol",
];
const EQUIPMENT = [
  "oven",
  "skillet",
  "pot",
  "sheet pan",
  "slow cooker",
  "grill",
  "blender",
  "air fryer",
];
const STEPS = ["Household", "Food needs", "Budget", "Kitchen"];
const label = (value: string) => value.replace(/_/g, " ");

function SetupPage() {
  const { state, ready, setHousehold, update, regeneratePlan } = useMealForge();
  const navigate = useNavigate();
  const [form, setForm] = useState(state.household);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (ready) setForm(state.household);
  }, [ready, state.household]);
  if (!ready) return <SetupSkeleton />;

  const setMembers = (count: number) => {
    const members: HouseholdMember[] = Array.from(
      { length: count },
      (_, index) =>
        form.members[index] ?? {
          id: `m${index + 1}`,
          name: `Person ${index + 1}`,
          ageGroup: "adult",
          appetite: 1,
        },
    );
    setForm({ ...form, members });
  };
  const toggle = <T extends string>(items: T[], value: T) =>
    items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
  const save = () => {
    setHousehold(form);
    update({ onboarded: true });
    setTimeout(() => regeneratePlan(), 0);
    void navigate({ to: "/app/plan" });
  };

  return (
    <div className="space-y-7">
      <header>
        <p className="kicker text-primary">
          Set your table · {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight">{STEPS[step]}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          MealForge uses these answers as hard limits. You can change them at any time.
        </p>
      </header>

      <ol className="grid grid-cols-4 gap-2" aria-label="Setup progress">
        {STEPS.map((item, index) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => index <= step && setStep(index)}
              className={`h-2 w-full ${index <= step ? "bg-primary" : "bg-muted"}`}
              aria-label={`${item}${index < step ? ", completed" : index === step ? ", current" : ""}`}
            />
            <span className="mt-2 hidden text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:block">
              {item}
            </span>
          </li>
        ))}
      </ol>

      <section className="editorial-card min-h-[430px] p-5 md:p-8">
        {step === 0 && (
          <div className="grid gap-6">
            <Field label="What should we call your household?">
              <input
                className="field-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="How many people are eating?">
              <input
                className="field-control"
                type="number"
                min={1}
                max={12}
                value={form.members.length}
                onChange={(e) => setMembers(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
              />
            </Field>
            <fieldset>
              <legend className="field-label">Who eats?</legend>
              <ul className="grid gap-3">
                {form.members.map((member, index) => (
                  <li key={member.id} className="grid gap-2 sm:grid-cols-[1fr_9rem]">
                    <label>
                      <span className="sr-only">Person {index + 1} name</span>
                      <input
                        className="field-control"
                        value={member.name}
                        onChange={(e) => {
                          const members = [...form.members];
                          members[index] = { ...member, name: e.target.value };
                          setForm({ ...form, members });
                        }}
                      />
                    </label>
                    <label>
                      <span className="sr-only">{member.name} age group</span>
                      <select
                        className="field-control"
                        value={member.ageGroup}
                        onChange={(e) => {
                          const ageGroup = e.target.value as HouseholdMember["ageGroup"];
                          const appetite =
                            ageGroup === "child" ? 0.6 : ageGroup === "teen" ? 1.2 : 1;
                          const members = [...form.members];
                          members[index] = { ...member, ageGroup, appetite };
                          setForm({ ...form, members });
                        }}
                      >
                        <option value="adult">Adult</option>
                        <option value="teen">Teen</option>
                        <option value="child">Child</option>
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-9">
            <ChipField
              legend="Food allergies"
              description="These ingredients are always excluded."
              options={ALLERGENS}
              selected={form.allergies}
              onToggle={(value) => setForm({ ...form, allergies: toggle(form.allergies, value) })}
            />
            <ChipField
              legend="Foods to avoid"
              description="Preferences and dietary choices."
              options={AVOID}
              selected={form.avoidTags}
              onToggle={(value) => setForm({ ...form, avoidTags: toggle(form.avoidTags, value) })}
            />
            <div className="border-l-4 border-primary bg-primary/10 p-4 text-sm leading-6">
              <strong>Safety first:</strong> allergy exclusions override cost, variety and every
              other planner score.
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <Field label="Weekly grocery budget">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">$</span>
                <input
                  className="field-control pl-8"
                  type="number"
                  min={10}
                  step={5}
                  value={form.weeklyBudget}
                  onChange={(e) => setForm({ ...form, weeklyBudget: Number(e.target.value) || 0 })}
                />
              </div>
            </Field>
            <Field label="Dinners to plan each week">
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`min-h-12 border border-border-strong font-bold ${form.dinnersPerWeek === count ? "bg-primary text-primary-foreground" : "bg-surface"}`}
                    onClick={() => setForm({ ...form, dinnersPerWeek: count })}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Primary grocery store">
              <select
                className="field-control"
                value={form.storeIds[0] ?? "heb"}
                onChange={(e) => setForm({ ...form, storeIds: [e.target.value] })}
              >
                {STORES.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-8">
            <ChipField
              legend="Available equipment"
              description="We will not suggest recipes that need equipment you do not have."
              options={EQUIPMENT}
              selected={form.equipment}
              onToggle={(value) => setForm({ ...form, equipment: toggle(form.equipment, value) })}
            />
            <Field label={`Maximum cooking time: ${form.maxCookMinutes} minutes`}>
              <input
                className="w-full accent-[var(--primary)]"
                type="range"
                min={10}
                max={120}
                step={5}
                value={form.maxCookMinutes}
                onChange={(e) => setForm({ ...form, maxCookMinutes: Number(e.target.value) })}
              />
            </Field>
            <div className="grid gap-3 bg-foreground p-5 text-background sm:grid-cols-3">
              <Summary value={`${form.members.length}`} label="people" />
              <Summary value={`$${form.weeklyBudget}`} label="weekly budget" />
              <Summary value={`${form.dinnersPerWeek}`} label="dinners" />
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="button-secondary disabled:opacity-30"
          disabled={step === 0}
          onClick={() => setStep((value) => value - 1)}
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="button-primary"
            onClick={() => setStep((value) => value + 1)}
          >
            Continue <ArrowRight className="size-4" />
          </button>
        ) : (
          <button type="button" className="button-primary" onClick={save}>
            <Check className="size-4" /> Build my week
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label: text, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{text}</span>
      {children}
    </label>
  );
}
function ChipField<T extends string>({
  legend,
  description,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  description: string;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="field-label text-lg">{legend}</legend>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(option)}
              className={`min-h-11 border px-4 py-2 text-sm font-bold capitalize ${on ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-surface"}`}
            >
              {on && <Check className="mr-1 inline size-4" />}
              {label(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
function Summary({ value, label: text }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-black text-primary">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-background/70">{text}</p>
    </div>
  );
}
function SetupSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-5 w-40 bg-muted" />
      <div className="h-12 w-64 bg-muted" />
      <div className="h-96 bg-muted" />
    </div>
  );
}
