import { supabase } from "@/lib/supabase";

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("Tbl_Users")
    .select("id, firm_id, name, email, role")
    .eq("supabase_uid", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function signUp({ email, password, name, firmName }) {
  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) throw signUpError;

  // Use SECURITY DEFINER RPC — bypasses RLS so we can insert Tbl_Firms
  // before Tbl_Users exists (get_my_firm_id() would return NULL otherwise).
  const { error } = await supabase.rpc("create_firm_and_user", {
    p_firm_name: firmName,
    p_firm_email: email,
    p_user_name: name,
  });
  if (error) throw error;
}

export async function completeFirmSetup({ firmName }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.rpc("create_firm_and_user", {
    p_firm_name: firmName,
    p_firm_email: user.email,
    p_user_name: user.user_metadata?.full_name || user.email,
  });
  if (error) throw error;
}
