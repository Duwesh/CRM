import { supabase } from "@/lib/supabase";

export async function getFirmId() {
  const { data, error } = await supabase.rpc("get_my_firm_id");
  if (error) throw error;
  if (!data) throw new Error("User record not found — signup may be incomplete");
  return data;
}
