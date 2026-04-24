import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getDeadlines() {
  const [{ data: deadlines, error }, { data: clients }] = await Promise.all([
    supabase.from("Tbl_Deadlines").select("*").eq("is_deleted", false).order("due_date"),
    supabase.from("Tbl_Clients").select("id, name").eq("is_deleted", false),
  ]);
  if (error) throw error;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  return (deadlines || []).map((d) => ({
    ...d,
    Client: clientMap[d.client_id] || null,
  }));
}

export async function createDeadline(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Deadlines")
    .insert({ ...payload, firm_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDeadline(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Deadlines")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDeadline(id) {
  const { error } = await supabase
    .from("Tbl_Deadlines")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
