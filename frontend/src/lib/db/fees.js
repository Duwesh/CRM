import { supabase } from "@/lib/supabase";

export async function getFeesSummary({ search = "" } = {}) {
  let q = supabase
    .from("Tbl_Clients")
    .select("id, name, annual_fee, status")
    .eq("is_deleted", false)
    .order("name");

  if (search) q = q.ilike("name", `%${search}%`);

  const [{ data: clients, error }, { data: invoices }] = await Promise.all([
    q,
    supabase
      .from("Tbl_Invoices")
      .select("client_id, amount, amount_received, status")
      .eq("is_deleted", false),
  ]);

  if (error) throw error;

  const invMap = {};
  (invoices || []).forEach((inv) => {
    if (!invMap[inv.client_id]) invMap[inv.client_id] = { billed: 0, collected: 0 };
    invMap[inv.client_id].billed += Number(inv.amount || 0);
    invMap[inv.client_id].collected += Number(inv.amount_received || 0);
  });

  return (clients || []).map((c) => ({
    ...c,
    billed: invMap[c.id]?.billed || 0,
    collected: invMap[c.id]?.collected || 0,
    outstanding: (invMap[c.id]?.billed || 0) - (invMap[c.id]?.collected || 0),
  }));
}

export async function updateClientFee(clientId, annual_fee) {
  const { data, error } = await supabase
    .from("Tbl_Clients")
    .update({ annual_fee })
    .eq("id", clientId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
