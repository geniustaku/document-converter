// pages/api/admin/invoices/[id]/pdf.ts - Generate invoice PDF (admin)
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { AuthUser, Invoice } from '@/types/billing';
import PDFDocument from 'pdfkit';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  admin: AuthUser
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Invoice ID is required' });
    }

    const isNumeric = /^\d+$/.test(id as string);

    // Get invoice with company details (admin can see all invoices)
    const result = await query<Invoice & { company_name: string }>(
      `SELECT i.*,
              c.name as company_name, c.email as company_email, c.company_id as company_code,
              c.address as company_address, c.city as company_city, c.province as company_province,
              c.postal_code as company_postal_code, c.vat_number as company_vat_number,
              c.phone as company_phone, c.contact_person as company_contact
       FROM invoices i
       INNER JOIN companies c ON i.company_id = c.id
       WHERE ${isNumeric ? 'i.id = @id' : 'i.invoice_number = @id'}`,
      [
        { name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id as string) : id },
      ]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const invoice = result.recordset[0] as any;

    // Get invoice items
    const itemsResult = await query<any>(
      `SELECT * FROM invoice_items WHERE invoice_id = @invoice_id ORDER BY sort_order`,
      [{ name: 'invoice_id', type: sql.Int, value: invoice.id }]
    );

    const items = itemsResult.recordset;

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Colors
    const primaryColor = '#1a365d';
    const accentColor = '#2563eb';
    const grayColor = '#6b7280';
    const lightGray = '#f3f4f6';

    // Header
    doc.fillColor(primaryColor)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('INVOICE', 50, 50);

    // Company branding
    doc.fillColor(accentColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Document Converter Pro', 400, 50, { align: 'right' })
       .font('Helvetica')
       .fontSize(9)
       .fillColor(grayColor)
       .text('docs-app.net', 400, 65, { align: 'right' })
       .text('accounts@drop-it.tech', 400, 77, { align: 'right' });

    // Invoice details box (wider to prevent overflow)
    doc.rect(320, 100, 225, 70).fill(lightGray);
    doc.fillColor(primaryColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Invoice Number:', 330, 110)
       .text('Issue Date:', 330, 125)
       .text('Due Date:', 330, 140)
       .text('Status:', 330, 155)
       .font('Helvetica')
       .fillColor('#000')
       .text(invoice.invoice_number, 430, 110, { width: 105, align: 'right' })
       .text(new Date(invoice.issue_date).toLocaleDateString('en-ZA'), 430, 125, { width: 105, align: 'right' })
       .text(new Date(invoice.due_date).toLocaleDateString('en-ZA'), 430, 140, { width: 105, align: 'right' });

    // Status badge
    const statusColors: Record<string, string> = {
      paid: '#10b981',
      pending: '#f59e0b',
      sent: '#3b82f6',
      overdue: '#ef4444',
      cancelled: '#6b7280',
    };
    doc.fillColor(statusColors[invoice.status] || grayColor)
       .text(invoice.status.toUpperCase(), 430, 155, { width: 105, align: 'right' });

    // Bill To section
    doc.fillColor(primaryColor)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('BILL TO', 50, 110);

    doc.fillColor('#000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(invoice.company_name, 50, 128)
       .font('Helvetica')
       .fontSize(9)
       .fillColor(grayColor);

    let billToY = 142;
    if (invoice.company_contact) {
      doc.text(`Attn: ${invoice.company_contact}`, 50, billToY);
      billToY += 12;
    }
    if (invoice.company_address) {
      doc.text(invoice.company_address, 50, billToY);
      billToY += 12;
    }
    if (invoice.company_city || invoice.company_province) {
      doc.text(`${invoice.company_city || ''} ${invoice.company_province || ''} ${invoice.company_postal_code || ''}`.trim(), 50, billToY);
      billToY += 12;
    }
    if (invoice.company_email) {
      doc.text(invoice.company_email, 50, billToY);
      billToY += 12;
    }
    if (invoice.company_vat_number) {
      doc.text(`VAT: ${invoice.company_vat_number}`, 50, billToY);
    }

    // Billing Period
    doc.fillColor(primaryColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Billing Period:', 50, 200)
       .font('Helvetica')
       .fillColor(grayColor)
       .text(`${new Date(invoice.billing_period_start).toLocaleDateString('en-ZA')} - ${new Date(invoice.billing_period_end).toLocaleDateString('en-ZA')}`, 120, 200);

    // Items table
    const tableTop = 230;
    const tableHeaders = ['Description', 'Qty', 'Unit Price', 'Amount'];
    const colWidths = [280, 50, 80, 80];
    const colStarts = [50, 330, 380, 460];

    // Table header
    doc.rect(50, tableTop, 495, 25).fill(primaryColor);
    doc.fillColor('#fff')
       .fontSize(9)
       .font('Helvetica-Bold');

    tableHeaders.forEach((header, i) => {
      const align = i === 0 ? 'left' : 'right';
      doc.text(header, colStarts[i], tableTop + 8, { width: colWidths[i], align });
    });

    // Table rows
    let rowY = tableTop + 25;
    doc.fillColor('#000').font('Helvetica').fontSize(9);

    items.forEach((item: any, index: number) => {
      const bgColor = index % 2 === 0 ? '#fff' : lightGray;
      doc.rect(50, rowY, 495, 25).fill(bgColor);

      doc.fillColor('#000')
         .text(item.description, colStarts[0] + 5, rowY + 8, { width: colWidths[0] - 10 })
         .text(item.quantity.toString(), colStarts[1], rowY + 8, { width: colWidths[1], align: 'right' })
         .text(`R ${item.unit_price.toFixed(2)}`, colStarts[2], rowY + 8, { width: colWidths[2], align: 'right' })
         .text(`R ${item.amount.toFixed(2)}`, colStarts[3], rowY + 8, { width: colWidths[3], align: 'right' });

      rowY += 25;
    });

    // Table border
    doc.rect(50, tableTop, 495, rowY - tableTop).stroke(primaryColor);

    // Totals section
    const totalsY = rowY + 20;
    const totalsX = 380;

    doc.fillColor(grayColor)
       .fontSize(10)
       .text('Subtotal:', totalsX, totalsY)
       .text(`VAT (${invoice.vat_rate}%):`, totalsX, totalsY + 18);

    doc.fillColor('#000')
       .text(`R ${invoice.subtotal.toFixed(2)}`, totalsX + 80, totalsY, { align: 'right', width: 65 })
       .text(`R ${invoice.vat_amount.toFixed(2)}`, totalsX + 80, totalsY + 18, { align: 'right', width: 65 });

    // Total box
    doc.rect(totalsX - 10, totalsY + 40, 170, 30).fill(primaryColor);
    doc.fillColor('#fff')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text('TOTAL:', totalsX, totalsY + 50)
       .text(`R ${invoice.total_amount.toFixed(2)}`, totalsX + 80, totalsY + 50, { align: 'right', width: 65 });

    // Amount paid & balance
    if (invoice.amount_paid > 0) {
      doc.fillColor('#10b981')
         .fontSize(10)
         .font('Helvetica')
         .text('Amount Paid:', totalsX, totalsY + 80)
         .text(`R ${invoice.amount_paid.toFixed(2)}`, totalsX + 80, totalsY + 80, { align: 'right', width: 65 });
    }

    if (invoice.balance_due > 0) {
      doc.fillColor('#ef4444')
         .font('Helvetica-Bold')
         .text('Balance Due:', totalsX, totalsY + 98)
         .text(`R ${invoice.balance_due.toFixed(2)}`, totalsX + 80, totalsY + 98, { align: 'right', width: 65 });
    }

    // Payment status badge
    if (invoice.status === 'paid') {
      doc.save();
      doc.rotate(-30, { origin: [150, totalsY + 50] });
      doc.rect(50, totalsY + 30, 200, 40).stroke('#10b981').lineWidth(3);
      doc.fillColor('#10b981')
         .fontSize(30)
         .font('Helvetica-Bold')
         .text('PAID', 100, totalsY + 38);
      doc.restore();
    }

    // Notes & Terms
    const notesY = totalsY + 130;

    if (invoice.notes) {
      doc.fillColor(primaryColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Notes:', 50, notesY)
         .font('Helvetica')
         .fillColor(grayColor)
         .fontSize(9)
         .text(invoice.notes, 50, notesY + 15, { width: 250 });
    }

    if (invoice.terms) {
      doc.fillColor(primaryColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Terms & Conditions:', 50, notesY + 60)
         .font('Helvetica')
         .fillColor(grayColor)
         .fontSize(9)
         .text(invoice.terms, 50, notesY + 75, { width: 495 });
    }

    // Footer
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(545, footerY).stroke(lightGray);

    doc.fillColor(grayColor)
       .fontSize(8)
       .text('Thank you for your business!', 50, footerY + 10, { align: 'center', width: 495 })
       .text('For payment inquiries, please contact accounts@drop-it.tech', 50, footerY + 22, { align: 'center', width: 495 });

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
}

export default withAdminAuth(handler);
