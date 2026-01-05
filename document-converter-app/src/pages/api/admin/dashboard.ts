// pages/api/admin/dashboard.ts - Admin dashboard statistics
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, DashboardStats } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DashboardStats>>,
  admin: AuthUser
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get company stats
    const companiesResult = await query<{ total: number; active: number }>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN subscription_status = 'active' AND is_active = 1 THEN 1 ELSE 0 END) as active
       FROM companies`,
      []
    );

    // Get invoice stats
    const invoicesResult = await query<{ total: number; pending: number; overdue: number }>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('pending', 'sent') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'overdue' OR (status IN ('pending', 'sent') AND due_date < CAST(GETUTCDATE() AS DATE)) THEN 1 ELSE 0 END) as overdue
       FROM invoices`,
      []
    );

    // Get revenue stats
    const revenueResult = await query<{ total: number; this_month: number }>(
      `SELECT
        ISNULL(SUM(amount_paid), 0) as total,
        ISNULL(SUM(CASE WHEN payment_date >= DATEADD(month, DATEDIFF(month, 0, GETUTCDATE()), 0) THEN amount_paid ELSE 0 END), 0) as this_month
       FROM invoices
       WHERE status = 'paid'`,
      []
    );

    // Get API usage stats
    const apiResult = await query<{ total: number; this_month: number }>(
      `SELECT
        ISNULL(SUM(total_api_calls), 0) as total,
        ISNULL(SUM(CASE WHEN year_month = FORMAT(GETUTCDATE(), 'yyyy-MM') THEN total_api_calls ELSE 0 END), 0) as this_month
       FROM monthly_usage_summary`,
      []
    );

    // Get recent activity
    const recentInvoices = await query<any>(
      `SELECT TOP 5 i.*, c.name as company_name
       FROM invoices i
       INNER JOIN companies c ON i.company_id = c.id
       ORDER BY i.created_at DESC`,
      []
    );

    const recentPayments = await query<any>(
      `SELECT TOP 5 p.*, c.name as company_name, i.invoice_number
       FROM payments p
       INNER JOIN companies c ON p.company_id = c.id
       INNER JOIN invoices i ON p.invoice_id = i.id
       WHERE p.status = 'success'
       ORDER BY p.created_at DESC`,
      []
    );

    const stats: DashboardStats & { recent_invoices: any[]; recent_payments: any[] } = {
      total_companies: companiesResult.recordset[0]?.total || 0,
      active_companies: companiesResult.recordset[0]?.active || 0,
      total_invoices: invoicesResult.recordset[0]?.total || 0,
      pending_invoices: invoicesResult.recordset[0]?.pending || 0,
      overdue_invoices: invoicesResult.recordset[0]?.overdue || 0,
      total_revenue: revenueResult.recordset[0]?.total || 0,
      revenue_this_month: revenueResult.recordset[0]?.this_month || 0,
      total_api_calls: apiResult.recordset[0]?.total || 0,
      api_calls_this_month: apiResult.recordset[0]?.this_month || 0,
      recent_invoices: recentInvoices.recordset,
      recent_payments: recentPayments.recordset,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
}

export default withAdminAuth(handler);
