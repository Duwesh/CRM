import { supabase } from "@/lib/supabase";

export async function downloadInvoicePDF(invoice) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-invoice-pdf`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoice_id: invoice.id }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "PDF generation failed" }));
    throw new Error(err.error || "PDF generation failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice-${invoice.invoice_number}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
