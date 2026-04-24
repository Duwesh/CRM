import { supabase } from "@/lib/supabase";

export async function getDocuments() {
  const [{ data: documents, error }, { data: clients }] = await Promise.all([
    supabase.from("Tbl_Documents").select("*").eq("is_deleted", false).order("created_at", { ascending: false }),
    supabase.from("Tbl_Clients").select("id, name").eq("is_deleted", false),
  ]);
  if (error) throw error;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  return (documents || []).map((d) => ({
    ...d,
    Client: clientMap[d.client_id] || null,
  }));
}

export async function createDocument(payload) {
  const { data, error } = await supabase
    .from("Tbl_Documents")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDocument(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Documents")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(id) {
  const { error } = await supabase
    .from("Tbl_Documents")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
