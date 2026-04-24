import { supabase } from "@/lib/supabase";

export async function getEngagements() {
  const [{ data: engagements, error }, { data: clients }, { data: team }] =
    await Promise.all([
      supabase.from("Tbl_Engagements").select("*").eq("is_deleted", false).order("created_at", { ascending: false }),
      supabase.from("Tbl_Clients").select("id, name").eq("is_deleted", false),
      supabase.from("Tbl_TeamMembers").select("id, name").eq("is_deleted", false),
    ]);

  if (error) throw error;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  const teamMap = Object.fromEntries((team || []).map((m) => [m.id, m]));

  return (engagements || []).map((e) => ({
    ...e,
    Client: clientMap[e.client_id] || null,
    assignee: teamMap[e.assigned_to] || null,
  }));
}

export async function createEngagement(payload) {
  const { data, error } = await supabase
    .from("Tbl_Engagements")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEngagement(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Engagements")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEngagement(id) {
  const { error } = await supabase
    .from("Tbl_Engagements")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
