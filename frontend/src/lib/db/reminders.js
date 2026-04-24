import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getReminders() {
  const [{ data: reminders, error }, { data: clients }, { data: team }] =
    await Promise.all([
      supabase.from("Tbl_Reminders").select("*").eq("is_deleted", false).order("reminder_date"),
      supabase.from("Tbl_Clients").select("id, name").eq("is_deleted", false),
      supabase.from("Tbl_TeamMembers").select("id, name").eq("is_deleted", false),
    ]);

  if (error) throw error;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  const teamMap = Object.fromEntries((team || []).map((m) => [m.id, m]));

  return (reminders || []).map((r) => ({
    ...r,
    Client: clientMap[r.client_id] || null,
    assignee: teamMap[r.assigned_to] || null,
  }));
}

export async function createReminder(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Reminders")
    .insert({ ...payload, firm_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReminder(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Reminders")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleReminder(id, currentState) {
  const { data, error } = await supabase
    .from("Tbl_Reminders")
    .update({ is_done: !currentState })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReminder(id) {
  const { error } = await supabase
    .from("Tbl_Reminders")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
