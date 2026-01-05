// pages/api/billing/invoices/index.ts - Client invoice list
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, Invoice } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Invoice[]>>,
  user: AuthUser
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { status, page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = 'company_id = @company_id';
    const params: { name: string; type: any; value: any }[] = [
      { name: 'company_id', type: sql.Int, value: user.company_id },
    ];

    if (status) {
      whereClause += ' AND status = @status';
      params.push({ name: 'status', type: sql.NVarChar, value: status });
    }

    params.push({ name: 'offset', type: sql.Int, value: offset });
    params.push({ name: 'limit', type: sql.Int, value: parseInt(limit as string) });

    const result = await query<Invoice>(
      `SELECT * FROM invoices
       WHERE ${whereClause}
       ORDER BY created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      params
    );

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM invoices WHERE ${whereClause}`,
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

export default withAuth(handler);
