// pages/api/admin/invoices/[id].ts - Get, update, delete single invoice
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, Invoice, UpdateInvoiceInput } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>,
  admin: AuthUser
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Invoice ID is required' });
  }

  if (req.method === 'GET') {
    return getInvoice(req, res, id as string);
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    return updateInvoice(req, res, id as string, admin);
  } else if (req.method === 'DELETE') {
    return deleteInvoice(req, res, id as string, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getInvoice(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>,
  id: string
) {
  try {
    // Support both numeric ID and invoice_number (INV-XXXX-XXXX)
    const isNumeric = /^\d+$/.test(id);

    const result = await query<Invoice & { company_name: string; company_email: string; company_address: string }>(
      `SELECT i.*,
              c.name as company_name, c.email as company_email, c.company_id as company_code,
              c.address as company_address, c.city as company_city, c.province as company_province,
              c.postal_code as company_postal_code, c.vat_number as company_vat_number,
              c.phone as company_phone
       FROM invoices i
       INNER JOIN companies c ON i.company_id = c.id
       WHERE ${isNumeric ? 'i.id = @id' : 'i.invoice_number = @id'}`,
      [{ name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id) : id }]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Get invoice items
    const itemsResult = await query<any>(
      `SELECT * FROM invoice_items WHERE invoice_id = @invoice_id ORDER BY sort_order`,
      [{ name: 'invoice_id', type: sql.Int, value: result.recordset[0].id }]
    );

    // Get payments for this invoice
    const paymentsResult = await query<any>(
      `SELECT * FROM payments WHERE invoice_id = @invoice_id ORDER BY created_at DESC`,
      [{ name: 'invoice_id', type: sql.Int, value: result.recordset[0].id }]
    );

    const invoice = {
      ...result.recordset[0],
      items: itemsResult.recordset,
      payments: paymentsResult.recordset,
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

async function updateInvoice(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice>>,
  id: string,
  admin: AuthUser
) {
  try {
    const isNumeric = /^\d+$/.test(id);
    const input: UpdateInvoiceInput & { items?: any[] } = req.body;

    // Get current invoice
    const currentResult = await query<Invoice>(
      `SELECT * FROM invoices WHERE ${isNumeric ? 'id = @id' : 'invoice_number = @id'}`,
      [{ name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id) : id }]
    );

    if (currentResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const currentInvoice = currentResult.recordset[0];

    // Build update query
    const updates: string[] = [];
    const params: { name: string; type: any; value: any }[] = [
      { name: 'id', type: sql.Int, value: currentInvoice.id },
    ];

    if (input.status !== undefined) {
      updates.push('status = @status');
      params.push({ name: 'status', type: sql.NVarChar, value: input.status });

      // If marking as paid, set payment date
      if (input.status === 'paid') {
        updates.push('payment_date = GETUTCDATE()');
        updates.push('balance_due = 0');
        updates.push('amount_paid = total_amount');
      }
    }

    if (input.due_date !== undefined) {
      updates.push('due_date = @due_date');
      params.push({ name: 'due_date', type: sql.Date, value: new Date(input.due_date) });
    }

    if (input.notes !== undefined) {
      updates.push('notes = @notes');
      params.push({ name: 'notes', type: sql.NVarChar, value: input.notes });
    }

    if (input.terms !== undefined) {
      updates.push('terms = @terms');
      params.push({ name: 'terms', type: sql.NVarChar, value: input.terms });
    }

    // Update items if provided - this takes precedence for amount calculations
    if (input.items && input.items.length > 0) {
      // Delete existing items
      await query(
        `DELETE FROM invoice_items WHERE invoice_id = @invoice_id`,
        [{ name: 'invoice_id', type: sql.Int, value: currentInvoice.id }]
      );

      // Calculate new subtotal
      const subtotal = input.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
      const vatRate = input.vat_rate ?? currentInvoice.vat_rate;
      const vatAmount = (subtotal * vatRate) / 100;
      const totalAmount = subtotal + vatAmount;
      const balanceDue = totalAmount - currentInvoice.amount_paid;

      updates.push('subtotal = @subtotal');
      if (input.vat_rate !== undefined) {
        updates.push('vat_rate = @vat_rate');
        params.push({ name: 'vat_rate', type: sql.Decimal, value: input.vat_rate });
      }
      updates.push('vat_amount = @vat_amount');
      updates.push('total_amount = @total_amount');
      updates.push('balance_due = @balance_due');
      params.push({ name: 'subtotal', type: sql.Decimal, value: subtotal });
      params.push({ name: 'vat_amount', type: sql.Decimal, value: vatAmount });
      params.push({ name: 'total_amount', type: sql.Decimal, value: totalAmount });
      params.push({ name: 'balance_due', type: sql.Decimal, value: balanceDue });

      // Insert new items
      for (let i = 0; i < input.items.length; i++) {
        const item = input.items[i];
        await query(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount, sort_order)
           VALUES (@invoice_id, @description, @quantity, @unit_price, @amount, @sort_order)`,
          [
            { name: 'invoice_id', type: sql.Int, value: currentInvoice.id },
            { name: 'description', type: sql.NVarChar, value: item.description },
            { name: 'quantity', type: sql.Decimal, value: item.quantity },
            { name: 'unit_price', type: sql.Decimal, value: item.unit_price },
            { name: 'amount', type: sql.Decimal, value: item.quantity * item.unit_price },
            { name: 'sort_order', type: sql.Int, value: i },
          ]
        );
      }
    } else if (input.vat_rate !== undefined) {
      // Only update VAT rate if no items provided (otherwise it's handled above)
      const vatAmount = (currentInvoice.subtotal * input.vat_rate) / 100;
      const totalAmount = currentInvoice.subtotal + vatAmount;
      const balanceDue = totalAmount - currentInvoice.amount_paid;

      updates.push('vat_rate = @vat_rate');
      updates.push('vat_amount = @vat_amount');
      updates.push('total_amount = @total_amount');
      updates.push('balance_due = @balance_due');
      params.push({ name: 'vat_rate', type: sql.Decimal, value: input.vat_rate });
      params.push({ name: 'vat_amount', type: sql.Decimal, value: vatAmount });
      params.push({ name: 'total_amount', type: sql.Decimal, value: totalAmount });
      params.push({ name: 'balance_due', type: sql.Decimal, value: balanceDue });
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push('updated_at = GETUTCDATE()');

    const result = await query<Invoice>(
      `UPDATE invoices SET ${updates.join(', ')} OUTPUT INSERTED.* WHERE id = @id`,
      params
    );

    // Get updated items
    const itemsResult = await query<any>(
      `SELECT * FROM invoice_items WHERE invoice_id = @invoice_id ORDER BY sort_order`,
      [{ name: 'invoice_id', type: sql.Int, value: currentInvoice.id }]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, actor_email, old_values, new_values)
       VALUES ('invoice_updated', 'invoice', @entity_id, 'admin', @actor_id, @actor_email, @old_values, @new_values)`,
      [
        { name: 'entity_id', type: sql.NVarChar, value: currentInvoice.invoice_number },
        { name: 'actor_id', type: sql.NVarChar, value: admin.user_id },
        { name: 'actor_email', type: sql.NVarChar, value: admin.email },
        { name: 'old_values', type: sql.NVarChar, value: JSON.stringify({ status: currentInvoice.status }) },
        { name: 'new_values', type: sql.NVarChar, value: JSON.stringify(input) },
      ]
    );

    return res.status(200).json({
      success: true,
      data: { ...result.recordset[0], items: itemsResult.recordset },
      message: 'Invoice updated successfully',
    });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update invoice' });
  }
}

async function deleteInvoice(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  id: string,
  admin: AuthUser
) {
  try {
    const isNumeric = /^\d+$/.test(id);

    const currentResult = await query<Invoice>(
      `SELECT * FROM invoices WHERE ${isNumeric ? 'id = @id' : 'invoice_number = @id'}`,
      [{ name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id) : id }]
    );

    if (currentResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const invoice = currentResult.recordset[0];

    // Cannot delete paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, error: 'Cannot delete paid invoices' });
    }

    // Mark as cancelled instead of deleting
    await query(
      `UPDATE invoices SET status = 'cancelled', updated_at = GETUTCDATE() WHERE id = @id`,
      [{ name: 'id', type: sql.Int, value: invoice.id }]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, actor_email, old_values)
       VALUES ('invoice_cancelled', 'invoice', @entity_id, 'admin', @actor_id, @actor_email, @old_values)`,
      [
        { name: 'entity_id', type: sql.NVarChar, value: invoice.invoice_number },
        { name: 'actor_id', type: sql.NVarChar, value: admin.user_id },
        { name: 'actor_email', type: sql.NVarChar, value: admin.email },
        { name: 'old_values', type: sql.NVarChar, value: JSON.stringify({ status: invoice.status, total: invoice.total_amount }) },
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Invoice cancelled successfully',
    });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete invoice' });
  }
}

export default withAdminAuth(handler);
