import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);
}

function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = (text || "").split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

// ─── PDF builder ──────────────────────────────────────────────────────────────

async function buildInvoicePDF(invoice: any, client: any, firm: any): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold    = await doc.embedFont(StandardFonts.HelveticaBold);

  const C = {
    gold:  rgb(0.788, 0.659, 0.298),
    dark:  rgb(0.114, 0.157, 0.196),
    gray:  rgb(0.392, 0.455, 0.545),
    light: rgb(0.941, 0.949, 0.961),
    line:  rgb(0.882, 0.894, 0.914),
    white: rgb(1, 1, 1),
    red:   rgb(0.859, 0.204, 0.204),
    green: rgb(0.133, 0.773, 0.369),
    amber: rgb(0.851, 0.702, 0.102),
    muted: rgb(0.6, 0.7, 0.8),
  };

  const M = 50; // page margin

  const draw = (str: string, x: number, y: number, opts: { size?: number; color?: any; font?: any } = {}) => {
    page.drawText(String(str ?? ""), {
      x, y,
      size:  opts.size  ?? 9,
      font:  opts.font  ?? regular,
      color: opts.color ?? C.dark,
    });
  };

  const drawRight = (str: string, rightEdge: number, y: number, opts: { size?: number; color?: any; font?: any } = {}) => {
    const f = opts.font ?? regular;
    const s = opts.size ?? 9;
    draw(str, rightEdge - f.widthOfTextAtSize(str, s), y, opts);
  };

  // ── HEADER BAND ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 115, width, height: 115, color: C.dark });

  draw(firm?.name ?? "Your Firm", M, height - 44, { font: bold, size: 21, color: C.white });
  drawRight("INVOICE", width - M, height - 44, { font: bold, size: 21, color: C.gold });

  const firmMeta = [firm?.address, firm?.phone, firm?.email].filter(Boolean).join("   ·   ");
  draw(firmMeta, M, height - 64, { size: 7.5, color: C.muted });
  if (firm?.reg_number) {
    draw(`GSTIN / Reg: ${firm.reg_number}`, M, height - 77, { size: 7.5, color: C.muted });
  }

  drawRight(`# ${invoice.invoice_number}`, width - M, height - 64, { font: bold, size: 11, color: C.gold });
  drawRight(`Date:  ${fmtDate(invoice.invoice_date)}`, width - M, height - 77, { size: 7.5, color: rgb(0.75, 0.82, 0.9) });
  drawRight(`Due:   ${fmtDate(invoice.due_date)}`,  width - M, height - 90, { size: 7.5, color: rgb(0.75, 0.82, 0.9) });

  // ── BILL TO ──────────────────────────────────────────────────────────────────
  let y = height - 143;
  draw("BILL TO", M, y, { font: bold, size: 7.5, color: C.gray });
  y -= 16;
  draw(client?.name ?? "Client", M, y, { font: bold, size: 14, color: C.dark });
  y -= 15;
  if (client?.email)   { draw(client.email,   M, y, { size: 8.5, color: C.gray }); y -= 13; }
  if (client?.phone)   { draw(client.phone,   M, y, { size: 8.5, color: C.gray }); y -= 13; }
  if (client?.address) { draw(client.address, M, y, { size: 8.5, color: C.gray }); y -= 13; }
  y -= 16;

  page.drawLine({ start: { x: M, y }, end: { x: width - M, y }, thickness: 0.5, color: C.line });
  y -= 22;

  // ── DESCRIPTION TABLE ────────────────────────────────────────────────────────
  page.drawRectangle({ x: M, y: y - 5, width: width - M * 2, height: 22, color: C.light });
  draw("DESCRIPTION", M + 10, y + 6, { font: bold, size: 7.5, color: C.gray });
  drawRight("AMOUNT", width - M - 10, y + 6, { font: bold, size: 7.5, color: C.gray });
  y -= 28;

  const subtotal  = Number(invoice.amount ?? 0) - Number(invoice.gst_amount ?? 0);
  const descMaxW  = width - M * 2 - 120;
  const descLines = wrapText(invoice.description ?? "Professional Services", descMaxW, regular, 9);
  const firstLineY = y;

  descLines.forEach((line) => {
    draw(line, M + 10, y, { size: 9 });
    y -= 14;
  });
  drawRight(`Rs. ${fmt(subtotal)}`, width - M - 10, firstLineY, { size: 9 });
  y -= 16;

  page.drawLine({ start: { x: M, y }, end: { x: width - M, y }, thickness: 0.5, color: C.line });
  y -= 16;

  // ── TOTALS ───────────────────────────────────────────────────────────────────
  const labelX = width - M - 160;
  const valX   = width - M - 10;

  const drawRow = (label: string, value: number, opts: { bold?: boolean; color?: any; size?: number } = {}) => {
    const f = opts.bold ? bold : regular;
    const s = opts.size ?? 9;
    const c = opts.color ?? C.gray;
    draw(label, labelX, y, { font: f, size: s, color: c });
    drawRight(`Rs. ${fmt(value)}`, valX, y, { font: f, size: s, color: c });
    y -= opts.size ? opts.size + 8 : 15;
  };

  drawRow("Subtotal", subtotal);
  const gst = Number(invoice.gst_amount ?? 0);
  if (gst > 0) drawRow("GST", gst);

  // total highlight band
  y -= 4;
  page.drawRectangle({ x: labelX - 12, y: y - 5, width: valX - labelX + 22, height: 22, color: C.dark });
  draw("TOTAL", labelX, y + 5, { font: bold, size: 9, color: C.white });
  drawRight(`Rs. ${fmt(Number(invoice.amount ?? 0))}`, valX, y + 5, { font: bold, size: 9, color: C.gold });
  y -= 30;

  const amtPaid = Number(invoice.amount_received ?? 0);
  drawRow("Amount Paid", amtPaid);

  const balance   = Number(invoice.amount ?? 0) - amtPaid;
  const balColor  = balance <= 0 ? C.green : C.red;
  y -= 4;
  draw("Balance Due", labelX, y, { font: bold, size: 10.5, color: balColor });
  drawRight(`Rs. ${fmt(balance)}`, valX, y, { font: bold, size: 10.5, color: balColor });
  y -= 34;

  // ── STATUS BADGE ─────────────────────────────────────────────────────────────
  const statusColors: Record<string, any> = {
    paid: C.green, unpaid: C.gray, partial: C.amber, overdue: C.red,
  };
  const sLabel = (invoice.status ?? "unpaid").toUpperCase();
  const sColor = statusColors[invoice.status ?? "unpaid"] ?? C.gray;
  const badgeW  = bold.widthOfTextAtSize(sLabel, 8) + 20;
  page.drawRectangle({ x: M, y: y - 5, width: badgeW, height: 20, color: sColor });
  draw(sLabel, M + 10, y + 3, { font: bold, size: 8, color: C.white });
  y -= 30;

  // ── NOTES ────────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    draw("Notes:", M, y, { font: bold, size: 8, color: C.gray }); y -= 13;
    wrapText(invoice.notes, width - M * 2, regular, 8).forEach((line) => {
      draw(line, M, y, { size: 8, color: C.gray }); y -= 12;
    });
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: M, y: 55 }, end: { x: width - M, y: 55 }, thickness: 0.5, color: C.line });
  draw("Thank you for your business.", M, 40, { size: 8, color: C.gray });
  drawRight("Generated by PV Advisory · FirmEdge CRM", width - M, 40, { size: 7.5, color: rgb(0.75, 0.75, 0.75) });

  return doc.save();
}

// ─── handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── verify caller owns this invoice via RLS ──────────────────────────────
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { error: authErr } = await userClient
      .from("Tbl_Invoices")
      .select("id")
      .eq("id", invoice_id)
      .eq("is_deleted", false)
      .single();

    if (authErr) {
      return new Response(JSON.stringify({ error: "Invoice not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── fetch full data with service role (bypasses RLS for joins) ───────────
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: invoice } = await admin
      .from("Tbl_Invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();

    const [{ data: client }, { data: firm }] = await Promise.all([
      admin.from("Tbl_Clients").select("name, email, phone, address").eq("id", invoice.client_id).single(),
      admin.from("Tbl_Firms").select("name, email, phone, address, reg_number").eq("id", invoice.firm_id).single(),
    ]);

    const pdfBytes = await buildInvoicePDF(invoice, client, firm);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
