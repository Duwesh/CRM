import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getInteractions() {
  const [{ data: interactions, error }, { data: clients }, { data: team }] =
    await Promise.all([
      supabase.from("Tbl_Interactions").select("*").eq("is_deleted", false).order("interaction_date", { ascending: false }),
      supabase.from("Tbl_Clients").select("id, name").eq("is_deleted", false),
      supabase.from("Tbl_TeamMembers").select("id, name").eq("is_deleted", false),
    ]);

  if (error) throw error;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  const teamMap = Object.fromEntries((team || []).map((m) => [m.id, m]));

  return (interactions || []).map((i) => ({
    ...i,
    Client: clientMap[i.client_id] || null,
    TeamMember: teamMap[i.team_member_id] || null,
  }));
}

export async function createInteraction(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Interactions")
    .insert({ ...payload, firm_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInteraction(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Interactions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInteraction(id) {
  const { error } = await supabase
    .from("Tbl_Interactions")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
