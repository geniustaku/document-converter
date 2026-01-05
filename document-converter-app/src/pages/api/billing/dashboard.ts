// pages/api/billing/dashboard.ts - Client dashboard data
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, CompanyDashboardStats } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<CompanyDashboardStats>>,
  user: AuthUser
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get company details with subscription plan
    const companyResult = await query<any>(
      `SELECT c.*, sp.name as plan_name, sp.slug as plan_slug, sp.plan_type, sp.api_calls_limit as plan_api_limit
       FROM companies c
       LEFT JOIN subscription_plans sp ON c.subscription_plan_id = sp.id
       WHERE c.id = @company_id`,
      [{ name: 'company_id', type: sql.Int, value: user.company_id }]
    );

    if (companyResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const company = companyResult.recordset[0];

    // Get current/pending invoice (most recent unpaid)
    const currentInvoiceResult = await query<any>(
      `SELECT TOP 1 * FROM invoices
       WHERE company_id = @company_id AND status IN ('pending', 'sent', 'overdue')
       ORDER BY due_date ASC`,
      [{ name: 'company_id', type: sql.Int, value: user.company_id }]
    );

    // Get recent invoices
    const recentInvoicesResult = await query<any>(
      `SELECT TOP 10 * FROM invoices
       WHERE company_id = @company_id
       ORDER BY created_at DESC`,
      [{ name: 'company_id', type: sql.Int, value: user.company_id }]
    );

    // Get API usage for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageResult = await query<{ total_api_calls: number }>(
      `SELECT ISNULL(total_api_calls, 0) as total_api_calls
       FROM monthly_usage_summary
       WHERE company_id = @company_id AND year_month = @month`,
      [
        { name: 'company_id', type: sql.Int, value: user.company_id },
        { name: 'month', type: sql.NVarChar, value: currentMonth },
      ]
    );

    // Get total paid amount
    const paidResult = await query<{ total: number }>(
      `SELECT ISNULL(SUM(amount_paid), 0) as total
       FROM invoices
       WHERE company_id = @company_id AND status = 'paid'`,
      [{ name: 'company_id', type: sql.Int, value: user.company_id }]
    );

    // Get outstanding balance
    const outstandingResult = await query<{ total: number }>(
      `SELECT ISNULL(SUM(balance_due), 0) as total
       FROM invoices
       WHERE company_id = @company_id AND status IN ('pending', 'sent', 'overdue')`,
      [{ name: 'company_id', type: sql.Int, value: user.company_id }]
    );

    // Calculate API calls remaining
    const apiLimit = company.api_calls_limit !== -1 ? company.api_calls_limit : (company.plan_api_limit || -1);
    const apiUsedThisMonth = usageResult.recordset[0]?.total_api_calls || 0;
    const apiRemaining = apiLimit === -1 ? -1 : Math.max(0, apiLimit - apiUsedThisMonth);

    const dashboardData: CompanyDashboardStats = {
      company,
      current_invoice: currentInvoiceResult.recordset[0] || undefined,
      recent_invoices: recentInvoicesResult.recordset,
      api_usage_this_month: apiUsedThisMonth,
      api_calls_remaining: apiRemaining,
      total_paid: paidResult.recordset[0]?.total || 0,
      outstanding_balance: outstandingResult.recordset[0]?.total || 0,
    };

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
}

export default withAuth(handler);
