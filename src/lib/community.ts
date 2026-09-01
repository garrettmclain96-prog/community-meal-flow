import { supabase } from "@/integrations/supabase/client";

/**
 * Live community-side reads.
 *
 * Impact events and approved kitchens are the only publicly readable surface;
 * household data never leaves the household's own rows.
 */

export interface KitchenRow {
  id: string;
  name: string;
  kind: string;
  city: string;
  neighborhood: string | null;
  daily_capacity_meals: number;
  cost_per_meal: number;
}

export interface TemplateRow {
  id: string;
  kitchen_id: string;
  name: string;
  description: string | null;
  servings_per_batch: number;
  cost_per_meal: number;
  dietary_tags: string[];
  active: boolean;
}

export async function listKitchens(): Promise<KitchenRow[]> {
  const { data, error } = await supabase
    .from("kitchens")
    .select("id, name, kind, city, neighborhood, daily_capacity_meals, cost_per_meal")
    .eq("approved", true)
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((k) => ({ ...k, cost_per_meal: Number(k.cost_per_meal) }));
}

export async function listTemplates(kitchenId?: string): Promise<TemplateRow[]> {
  let q = supabase.from("meal_templates").select("*").eq("active", true);
  if (kitchenId) q = q.eq("kitchen_id", kitchenId);
  const { data, error } = await q.order("name");
  if (error) throw error;
  return (data ?? []).map((t) => ({ ...t, cost_per_meal: Number(t.cost_per_meal) }));
}

export interface ImpactTotals {
  mealsFunded: number;
  mealsDelivered: number;
  kitchens: number;
  neighborhoods: Array<{ neighborhood: string; meals: number }>;
  recent: Array<{ id: string; kind: string; meals: number; neighborhood: string | null; occurred_at: string }>;
}

export async function loadImpactTotals(): Promise<ImpactTotals> {
  const [events, kitchens] = await Promise.all([
    supabase
      .from("impact_events")
      .select("id, kind, meals, neighborhood, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(1000),
    supabase.from("kitchens").select("id", { count: "exact", head: true }).eq("approved", true),
  ]);
  if (events.error) throw events.error;

  const rows = events.data ?? [];
  const byHood = new Map<string, number>();
  let funded = 0;
  let delivered = 0;
  for (const e of rows) {
    if (e.kind === "funded") {
      funded += e.meals;
      const hood = e.neighborhood ?? "Unassigned";
      byHood.set(hood, (byHood.get(hood) ?? 0) + e.meals);
    }
    if (e.kind === "delivered") delivered += e.meals;
  }

  return {
    mealsFunded: funded,
    mealsDelivered: delivered,
    kitchens: kitchens.count ?? 0,
    neighborhoods: [...byHood.entries()]
      .map(([neighborhood, meals]) => ({ neighborhood, meals }))
      .sort((a, b) => b.meals - a.meals),
    recent: rows.slice(0, 12),
  };
}

export async function fundMeals(input: {
  kitchenId: string;
  templateId: string | null;
  meals: number;
  sponsorName?: string;
}) {
  const { data, error } = await supabase.rpc("fund_meals", {
    _kitchen_id: input.kitchenId,
    _template_id: input.templateId,
    _meals: input.meals,
    _sponsor_name: input.sponsorName ?? null,
  } as never);

  if (error) throw error;
  return data as string;
}

export async function advanceOrder(orderId: string, status: "accepted" | "prepared" | "delivered") {
  const { error } = await supabase.rpc("advance_order", { _order_id: orderId, _status: status });
  if (error) throw error;
}
