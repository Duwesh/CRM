import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getLeads() {
  const { data, error } = await supabase
    .from("Tbl_Leads")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLead(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Leads")
    .insert({ ...payload, firm_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Leads")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLead(id) {
  const { error } = await supabase
    .from("Tbl_Leads")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
