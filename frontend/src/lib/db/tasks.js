import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getTasks() {
  const [{ data: tasks, error }, { data: clients }, { data: team }] =
    await Promise.all([
      supabase.from("Tbl_Tasks").select("*").eq("is_deleted", false).order("created_at", { ascending: false }),
      supabase.from("Tbl_Clients").select("id, name").eq("is_deleted", false),
      supabase.from("Tbl_TeamMembers").select("id, name").eq("is_deleted", false),
    ]);

  if (error) throw error;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  const teamMap = Object.fromEntries((team || []).map((m) => [m.id, m]));

  return (tasks || []).map((t) => ({
    ...t,
    Client: clientMap[t.client_id] || null,
    assignee: teamMap[t.assigned_to] || null,
  }));
}

export async function createTask(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Tasks")
    .insert({ ...payload, firm_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Tasks")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from("Tbl_Tasks")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
