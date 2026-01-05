// pages/api/billing/payments/index.ts - Get company payments
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { PaginatedResponse, ApiResponse, AuthUser, Payment } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<Payment> | ApiResponse>,
  user: AuthUser
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM payments p
       INNER JOIN invoices i ON p.invoice_id = i.id
       WHERE i.company_id = @company_id`,
      [{ name: 'company_id', type: sql.Int, value: user.company_id }]
    );

    const total = countResult.recordset[0]?.total || 0;

    // Get payments
    const result = await query<Payment>(
      `SELECT p.id, p.payment_id, p.invoice_id, p.amount, p.payment_method,
              p.status, p.paystack_transaction_id as transaction_id,
              COALESCE(p.processed_at, p.created_at) as payment_date, p.notes, p.created_at
       FROM payments p
       INNER JOIN invoices i ON p.invoice_id = i.id
       WHERE i.company_id = @company_id
       ORDER BY p.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      [
        { name: 'company_id', type: sql.Int, value: user.company_id },
        { name: 'offset', type: sql.Int, value: offset },
        { name: 'limit', type: sql.Int, value: limitNum },
      ]
    );

    return res.status(200).json({
      success: true,
      data: result.recordset,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch payments' });
  }
}

export default withAuth(handler);
