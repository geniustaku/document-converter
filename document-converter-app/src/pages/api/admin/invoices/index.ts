// pages/api/admin/invoices/index.ts - List and create invoices
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, generateInvoiceNumber } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, Invoice, CreateInvoiceInput } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice | Invoice[]>>,
  admin: AuthUser
) {
  if (req.method === 'GET') {
    return getInvoices(req, res);
  } else if (req.method === 'POST') {
    return createInvoice(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getInvoices(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice[]>>
) {
  try {
    const { status, company_id, search, page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = '1=1';
    const params: { name: string; type: any; value: any }[] = [];

    if (status) {
      whereClause += ' AND i.status = @status';
      params.push({ name: 'status', type: sql.NVarChar, value: status });
    }

    if (company_id) {
      whereClause += ' AND i.company_id = @company_id';
      params.push({ name: 'company_id', type: sql.Int, value: parseInt(company_id as string) });
    }

    if (search) {
      whereClause += ' AND (i.invoice_number LIKE @search OR c.name LIKE @search)';
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    params.push({ name: 'offset', type: sql.Int, value: offset });
    params.push({ name: 'limit', type: sql.Int, value: parseInt(limit as string) });

    const result = await query<Invoice & { company_name: string; company_email: string }>(
      `SELECT i.*, c.name as company_name, c.email as company_email, c.company_id as company_code
       FROM invoices i
       INNER JOIN companies c ON i.company_id = c.id
       WHERE ${whereClause}
       ORDER BY i.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      params
    );

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM invoices i
       INNER JOIN companies c ON i.company_id = c.id
       WHERE ${whereClause}`,
      params.filter(p => !['offset', 'limit'].includes(p.name))
    );

    return res.status(200).json({
      success: true,
      data: result.recordset,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: countResult.recordset[0]?.total || 0,
        total_pages: Math.ceil((countResult.recordset[0]?.total || 0) / parseInt(limit as string)),
      },
    } as any);
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
}

async function createInvoice(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>,
  admin: AuthUser
) {
  try {
    const input: CreateInvoiceInput = req.body;

    // Validate required fields
    if (!input.company_id || !input.billing_period_start || !input.billing_period_end || !input.due_date) {
      return res.status(400).json({ success: false, error: 'Company, billing period, and due date are required' });
    }

    if (!input.items || input.items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one invoice item is required' });
    }

    // Verify company exists
    const companyResult = await query<{ id: number; name: string }>(
      `SELECT id, name FROM companies WHERE id = @company_id AND is_active = 1`,
      [{ name: 'company_id', type: sql.Int, value: input.company_id }]
    );

    if (companyResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate amounts
    const subtotal = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const vatRate = input.vat_rate ?? 15;
    const vatAmount = (subtotal * vatRate) / 100;
    const totalAmount = subtotal + vatAmount;

    // Create invoice
    const invoiceResult = await query<Invoice>(
      `INSERT INTO invoices (
        invoice_number, company_id, billing_period_start, billing_period_end,
        issue_date, due_date, subtotal, vat_rate, vat_amount, total_amount,
        balance_due, status, notes, terms, created_by
      )
      OUTPUT INSERTED.*
      VALUES (
        @invoice_number, @company_id, @billing_period_start, @billing_period_end,
        CAST(GETUTCDATE() AS DATE), @due_date, @subtotal, @vat_rate, @vat_amount, @total_amount,
        @total_amount, @status, @notes, @terms, @created_by
      )`,
      [
        { name: 'invoice_number', type: sql.NVarChar, value: invoiceNumber },
        { name: 'company_id', type: sql.Int, value: input.company_id },
        { name: 'billing_period_start', type: sql.Date, value: new Date(input.billing_period_start) },
        { name: 'billing_period_end', type: sql.Date, value: new Date(input.billing_period_end) },
        { name: 'due_date', type: sql.Date, value: new Date(input.due_date) },
        { name: 'subtotal', type: sql.Decimal, value: subtotal },
        { name: 'vat_rate', type: sql.Decimal, value: vatRate },
        { name: 'vat_amount', type: sql.Decimal, value: vatAmount },
        { name: 'total_amount', type: sql.Decimal, value: totalAmount },
        { name: 'status', type: sql.NVarChar, value: input.status || 'pending' },
        { name: 'notes', type: sql.NVarChar, value: input.notes || null },
        { name: 'terms', type: sql.NVarChar, value: input.terms || 'Payment due within 7 days of invoice date.' },
        { name: 'created_by', type: sql.Int, value: admin.id },
      ]
    );

    const invoice = invoiceResult.recordset[0];

    // Insert invoice items
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      await query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount, sort_order)
         VALUES (@invoice_id, @description, @quantity, @unit_price, @amount, @sort_order)`,
        [
          { name: 'invoice_id', type: sql.Int, value: invoice.id },
          { name: 'description', type: sql.NVarChar, value: item.description },
          { name: 'quantity', type: sql.Decimal, value: item.quantity },
          { name: 'unit_price', type: sql.Decimal, value: item.unit_price },
          { name: 'amount', type: sql.Decimal, value: item.quantity * item.unit_price },
          { name: 'sort_order', type: sql.Int, value: i },
        ]
      );
    }

    // Get invoice with items
    const itemsResult = await query<any>(
      `SELECT * FROM invoice_items WHERE invoice_id = @invoice_id ORDER BY sort_order`,
      [{ name: 'invoice_id', type: sql.Int, value: invoice.id }]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, actor_email, new_values)
       VALUES ('invoice_created', 'invoice', @entity_id, 'admin', @actor_id, @actor_email, @new_values)`,
      [
        { name: 'entity_id', type: sql.NVarChar, value: invoiceNumber },
        { name: 'actor_id', type: sql.NVarChar, value: admin.user_id },
        { name: 'actor_email', type: sql.NVarChar, value: admin.email },
        { name: 'new_values', type: sql.NVarChar, value: JSON.stringify({ company_id: input.company_id, total: totalAmount }) },
      ]
    );

    return res.status(201).json({
      success: true,
      data: { ...invoice, items: itemsResult.recordset },
      message: 'Invoice created successfully',
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create invoice' });
  }
}

export default withAdminAuth(handler);
