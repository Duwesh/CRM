import { supabase } from "@/lib/supabase";

export async function downloadInvoicePDF(invoice) {
  const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
    body: { invoice_id: invoice.id },
  });

  if (error) throw new Error(error.message || "PDF generation failed");

  const blob = new Blob([data], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `Invoice-${invoice.invoice_number}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
