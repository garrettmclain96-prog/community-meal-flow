import { supabase } from "@/integrations/supabase/client";

/**
 * Volunteer reads and writes.
 *
 * Volunteers see kitchens, open shifts and open delivery runs. They never see
 * who receives a meal — runs carry a kitchen and a drop-off area only.
 */

export interface VolunteerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string;
  neighborhoods: string[];
  skills: string[];
  can_drive: boolean;
  availability: string[];
  agreement_accepted_at: string | null;
  active: boolean;
}

export interface ShiftRow {
  id: string;
  kitchen_id: string;
  title: string;
  role: string;
  starts_at: string;
  ends_at: string;
  slots: number;
  notes: string | null;
  neighborhood: string | null;
}

export interface SignupRow {
  id: string;
  shift_id: string;
  volunteer_id: string;
  status: string;
  hours: number;
}

export interface RunRow {
  id: string;
  order_id: string;
  kitchen_id: string;
  volunteer_id: string | null;
  meals: number;
  dropoff_area: string | null;
  window_start: string;
  window_end: string;
  status: string;
  picked_up_at: string | null;
  delivered_at: string | null;
}

export const VOLUNTEER_SKILLS = [
  "delivery driving",
  "meal prep",
  "line cooking",
  "serving",
  "cleanup",
  "packing",
  "event hosting",
  "intake and greeting",
  "spanish speaking",
  "heavy lifting",
] as const;

export const AVAILABILITY_BLOCKS = [
  "weekday mornings",
  "weekday middays",
  "weekday evenings",
  "saturday",
  "sunday",
] as const;

export const SHIFT_ROLES = [
  "prep",
  "cook",
  "serve",
  "pack",
  "cleanup",
  "delivery",
  "event",
] as const;

export async function loadMyVolunteer(userId: string): Promise<VolunteerProfile | null> {
  const { data, error } = await supabase
    .from("volunteers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as VolunteerProfile | null) ?? null;
}

export async function upsertVolunteer(
  userId: string,
  patch: Partial<VolunteerProfile> & { full_name: string },
): Promise<VolunteerProfile> {
  const { data, error } = await supabase
    .from("volunteers")
    .upsert({ ...patch, user_id: userId }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data as VolunteerProfile;
}

export async function listUpcomingShifts(): Promise<ShiftRow[]> {
  const { data, error } = await supabase
    .from("volunteer_shifts")
    .select("*")
    .gte("ends_at", new Date(Date.now() - 6 * 3600_000).toISOString())
    .order("starts_at");
  if (error) throw error;
  return (data ?? []) as ShiftRow[];
}

export async function listShiftsForKitchen(kitchenId: string): Promise<ShiftRow[]> {
  const { data, error } = await supabase
    .from("volunteer_shifts")
    .select("*")
    .eq("kitchen_id", kitchenId)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ShiftRow[];
}

export async function listSignups(): Promise<SignupRow[]> {
  const { data, error } = await supabase.from("shift_signups").select("*");
  if (error) throw error;
  return (data ?? []) as SignupRow[];
}

export async function joinShift(shiftId: string, volunteerId: string) {
  const { error } = await supabase
    .from("shift_signups")
    .insert({ shift_id: shiftId, volunteer_id: volunteerId });
  if (error) throw error;
}

export async function leaveShift(signupId: string) {
  const { error } = await supabase.from("shift_signups").delete().eq("id", signupId);
  if (error) throw error;
}

export async function completeShift(signupId: string, hours: number) {
  const { error } = await supabase
    .from("shift_signups")
    .update({ status: "completed", hours })
    .eq("id", signupId);
  if (error) throw error;
}

export async function listRuns(): Promise<RunRow[]> {
  const { data, error } = await supabase
    .from("delivery_runs")
    .select("*")
    .order("window_start", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RunRow[];
}

export async function claimRun(runId: string) {
  const { error } = await supabase.rpc("claim_delivery_run", { _run_id: runId });
  if (error) throw error;
}

export async function advanceRun(runId: string, status: "picked_up" | "delivered" | "released") {
  const { error } = await supabase.rpc("advance_delivery_run", {
    _run_id: runId,
    _status: status,
  });
  if (error) throw error;
}

export async function claimKitchen(kitchenId: string, role: string, note: string) {
  const { error } = await supabase.rpc("claim_kitchen", {
    _kitchen_id: kitchenId,
    _role: role || undefined,
    _note: note || undefined,
  });
  if (error) throw error;
}
