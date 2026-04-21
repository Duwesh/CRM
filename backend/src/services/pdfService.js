import puppeteer from 'puppeteer';

export const generateInvoicePDF = async (data) => {
  const totalAmount = data.amount + (data.gst_amount || 0);
  const balance = totalAmount - (data.amount_received || 0);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #6366f1; padding-bottom: 24px; }
      .firm-info h1 { font-size: 26px; font-weight: 700; color: #6366f1; }
      .firm-info p { font-size: 13px; color: #64748b; margin-top: 4px; }
      .invoice-meta { text-align: right; }
      .invoice-meta .invoice-num { font-size: 22px; font-weight: 700; color: #1a1a2e; }
      .invoice-meta .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 8px;
        background: ${data.status === 'paid' ? '#d1fae5' : data.status === 'partial' ? '#fef3c7' : '#fee2e2'};
        color: ${data.status === 'paid' ? '#065f46' : data.status === 'partial' ? '#92400e' : '#991b1b'}; }
      .bill-section { display: flex; gap: 40px; margin-bottom: 32px; }
      .bill-box { flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; }
      .bill-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
      .bill-box p { font-size: 14px; font-weight: 600; }
      .bill-box span { font-size: 12px; color: #64748b; display: block; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      thead th { background: #6366f1; color: white; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; }
      tbody td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
      .totals { margin-left: auto; width: 280px; }
      .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
      .totals-row.total { font-weight: 700; font-size: 16px; color: #6366f1; border-top: 2px solid #6366f1; border-bottom: none; padding-top: 12px; }
      .totals-row.balance { font-weight: 700; font-size: 15px; color: #dc2626; }
      .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="firm-info">
        ${data.logo_url ? `<img src="${data.logo_url}" height="50" style="margin-bottom:8px" />` : ''}
        <h1>${data.firm?.name || data.firm_name || ''}</h1>
        <p>${data.firm?.address || data.firm_address || ''}</p>
        <p>${data.firm?.phone || data.firm_phone || ''} ${ (data.firm?.email || data.firm_email) ? '· ' + (data.firm?.email || data.firm_email) : ''}</p>
      </div>
      <div class="invoice-meta">
        <div class="invoice-num">${data.invoice_number}</div>
        <div class="badge">${(data.status || 'UNPAID').toUpperCase()}</div>
        <p style="font-size:12px;color:#64748b;margin-top:8px">Date: ${data.invoice_date}</p>
        ${data.due_date ? `<p style="font-size:12px;color:#64748b">Due: ${data.due_date}</p>` : ''}
      </div>
    </div>

    <div class="bill-section">
      <div class="bill-box">
        <h3>Bill To</h3>
        <p>${data.client?.name || data.client_name || ''}</p>
        ${(data.client?.gstin || data.client_gstin) ? `<span>GSTIN: ${data.client?.gstin || data.client_gstin}</span>` : ''}
        ${(data.client?.email || data.client_email) ? `<span>${data.client?.email || data.client_email}</span>` : ''}
        ${(data.client?.phone || data.client_phone) ? `<span>${data.client?.phone || data.client_phone}</span>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:60%">Description</th>
          <th style="text-align:right">Amount</th>
          <th style="text-align:right">GST</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${data.description ?? 'Professional Services'}</td>
          <td style="text-align:right">₹${(data.amount || 0).toLocaleString('en-IN')}</td>
          <td style="text-align:right">₹${(data.gst_amount || 0).toLocaleString('en-IN')}</td>
          <td style="text-align:right">₹${totalAmount.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>₹${(data.amount || 0).toLocaleString('en-IN')}</span></div>
      <div class="totals-row"><span>GST</span><span>₹${(data.gst_amount || 0).toLocaleString('en-IN')}</span></div>
      <div class="totals-row total"><span>Total</span><span>₹${totalAmount.toLocaleString('en-IN')}</span></div>
      ${data.amount_received > 0 ? `<div class="totals-row" style="color:#16a34a"><span>Amount Received</span><span>₹${data.amount_received.toLocaleString('en-IN')}</span></div>` : ''}
      ${balance > 0 ? `<div class="totals-row balance"><span>Balance Due</span><span>₹${balance.toLocaleString('en-IN')}</span></div>` : ''}
    </div>

    <div class="footer">
      <p>Thank you for your business · Generated by FirmEdge CRM</p>
    </div>
  </body>
  </html>`;

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
  await browser.close();

  return Buffer.from(pdfBuffer);
};
