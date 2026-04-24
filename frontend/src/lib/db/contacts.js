import { supabase } from "@/lib/supabase";

export async function getContacts({ page = 1, limit = 50, search = "" } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase
    .from("Tbl_Contacts")
    .select("*, Tbl_Clients(id, name)", { count: "exact" })
    .eq("is_deleted", false)
    .order("name")
    .range(from, to);

  if (search) {
    q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,mobile.ilike.%${search}%`);
  }

  const { data, count, error } = await q;
  if (error) throw error;

  return {
    contacts: (data || []).map((c) => ({ ...c, Client: c.Tbl_Clients || null })),
    total: count || 0,
  };
}

export async function createContact(payload) {
  const { data, error } = await supabase
    .from("Tbl_Contacts")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContact(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Contacts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContact(id) {
  const { error } = await supabase
    .from("Tbl_Contacts")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
