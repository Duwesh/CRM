import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getInvoices({ page = 1, limit = 10 } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [{ data: invoices, count, error }, { data: clients }] = await Promise.all([
    supabase
      .from("Tbl_Invoices")
      .select("*", { count: "exact" })
      .eq("is_deleted", false)
      .order("invoice_date", { ascending: false })
      .range(from, to),
    supabase.from("Tbl_Clients").select("id, name").eq("is_deleted", false),
  ]);

  if (error) throw error;

  const clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c]));
  const enriched = (invoices || []).map((inv) => ({
    ...inv,
    Client: clientMap[inv.client_id] || null,
  }));

  return { invoices: enriched, total: count || 0 };
}

export async function getInvoiceStats() {
  const { data, error } = await supabase
    .from("Tbl_Invoices")
    .select("amount, gst_amount, amount_received, status, due_date")
    .eq("is_deleted", false);
  if (error) throw error;

  const today = new Date().toISOString().split("T")[0];
  const rows = data || [];

  return {
    total: rows.reduce((s, r) => s + Number(r.amount || 0), 0),
    collected: rows.reduce((s, r) => s + Number(r.amount_received || 0), 0),
    outstanding: rows
      .filter((r) => r.status !== "paid")
      .reduce((s, r) => s + (Number(r.amount || 0) - Number(r.amount_received || 0)), 0),
    overdue: rows.filter((r) => r.status !== "paid" && r.due_date && r.due_date < today).length,
  };
}

export async function createInvoice(payload) {
  const firm_id = await getFirmId();
  const { data: invoiceNumber, error: rpcError } = await supabase.rpc(
    "generate_invoice_number",
    { p_firm_id: firm_id }
  );
  if (rpcError) throw rpcError;

  const { data, error } = await supabase
    .from("Tbl_Invoices")
    .insert({ ...payload, firm_id, invoice_number: invoiceNumber, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvoice(id, payload) {
  const { data, error } = await supabase
    .from("Tbl_Invoices")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id) {
  const { error } = await supabase
    .from("Tbl_Invoices")
    .update({ is_deleted: true })
    .eq("id", id);
  if (error) throw error;
}
