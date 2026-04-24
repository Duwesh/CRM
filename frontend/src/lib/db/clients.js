import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getClients({ search = "" } = {}) {
  let q = supabase
    .from("Tbl_Clients")
    .select("*, Tbl_TeamMembers(id, name)")
    .eq("is_deleted", false)
    .order("name");

  if (search) {
    q = q.or(`name.ilike.%${search}%,pan.ilike.%${search}%,gstin.ilike.%${search}%`);
  }

  const { data, error } = await q;
  if (error) throw error;

  return (data || []).map((c) => ({
    ...c,
    Manager: c.Tbl_TeamMembers || null,
  }));
}

export async function createClient(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Clients")
    .insert({ ...payload, firm_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClient(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Clients")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id) {
  const { error } = await supabase
    .from("Tbl_Clients")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
