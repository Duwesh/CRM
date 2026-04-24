import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getTeamMembers() {
  const { data, error } = await supabase
    .from("Tbl_TeamMembers")
    .select("*")
    .eq("is_deleted", false)
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function createTeamMember(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_TeamMembers")
    .insert({ ...payload, firm_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeamMember(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_TeamMembers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeamMember(id) {
  const { error } = await supabase
    .from("Tbl_TeamMembers")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
