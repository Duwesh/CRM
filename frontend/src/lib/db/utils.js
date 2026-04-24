import { supabase } from "@/lib/supabase";

export async function getFirmId() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("Tbl_Users")
    .select("firm_id")
    .eq("supabase_uid", user.id)
    .single();
  if (error) throw error;
  return data.firm_id;
}
