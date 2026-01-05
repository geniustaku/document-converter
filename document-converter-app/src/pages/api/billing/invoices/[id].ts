// pages/api/billing/invoices/[id].ts - Get single invoice with details
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, Invoice } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>,
  user: AuthUser
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

    // Get invoice with company details
    const result = await query<Invoice & { company_name: string }>(
      `SELECT i.*,
              c.name as company_name, c.email as company_email, c.company_id as company_code,
              c.address as company_address, c.city as company_city, c.province as company_province,
              c.postal_code as company_postal_code, c.vat_number as company_vat_number,
              c.phone as company_phone, c.contact_person as company_contact
       FROM invoices i
       INNER JOIN companies c ON i.company_id = c.id
       WHERE ${isNumeric ? 'i.id = @id' : 'i.invoice_number = @id'}
         AND i.company_id = @company_id`,
      [
        { name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id as string) : id },
        { name: 'company_id', type: sql.Int, value: user.company_id },
      ]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Get invoice items
    const itemsResult = await query<any>(
      `SELECT * FROM invoice_items WHERE invoice_id = @invoice_id ORDER BY sort_order`,
      [{ name: 'invoice_id', type: sql.Int, value: result.recordset[0].id }]
    );

    // Get payments
    const paymentsResult = await query<any>(
      `SELECT * FROM payments WHERE invoice_id = @invoice_id ORDER BY created_at DESC`,
      [{ name: 'invoice_id', type: sql.Int, value: result.recordset[0].id }]
    );

    // Check if payment is allowed (billing period has ended)
    const billingPeriodEnd = new Date(result.recordset[0].billing_period_end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const canPay = today >= billingPeriodEnd && result.recordset[0].status !== 'paid' && result.recordset[0].status !== 'cancelled';

    const invoice = {
      ...result.recordset[0],
      items: itemsResult.recordset,
      payments: paymentsResult.recordset,
      can_pay: canPay,
    };

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
  }
}

export default withAuth(handler);
