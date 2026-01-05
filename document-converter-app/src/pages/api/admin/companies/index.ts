// pages/api/admin/companies/index.ts - List and create companies
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, generateCompanyId, generateApiKey, generateApiSecret, hashPassword, generateUserId } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, Company, CreateCompanyInput } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Company | Company[]>>,
  admin: AuthUser
) {
  if (req.method === 'GET') {
    return getCompanies(req, res);
  } else if (req.method === 'POST') {
    return createCompany(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getCompanies(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Company[]>>
) {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = '1=1';
    const params: { name: string; type: any; value: any }[] = [];

    if (status) {
      whereClause += ' AND c.subscription_status = @status';
      params.push({ name: 'status', type: sql.NVarChar, value: status });
    }

    if (search) {
      whereClause += ' AND (c.name LIKE @search OR c.email LIKE @search OR c.company_id LIKE @search)';
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    params.push({ name: 'offset', type: sql.Int, value: offset });
    params.push({ name: 'limit', type: sql.Int, value: parseInt(limit as string) });

    const result = await query<Company>(
      `SELECT c.*, sp.name as plan_name, sp.slug as plan_slug, sp.plan_type
       FROM companies c
       LEFT JOIN subscription_plans sp ON c.subscription_plan_id = sp.id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      params
    );

    // Get total count
    const countResult = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM companies c WHERE ${whereClause}`,
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
    console.error('Get companies error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
}

async function createCompany(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Company>>,
  admin: AuthUser
) {
  try {
    const input: CreateCompanyInput & { user_email?: string; user_password?: string; user_first_name?: string; user_last_name?: string } = req.body;

    // Validate required fields
    if (!input.name || !input.email) {
      return res.status(400).json({ success: false, error: 'Company name and email are required' });
    }

    // Check if email already exists
    const existingCompany = await query<{ id: number }>(
      `SELECT id FROM companies WHERE email = @email`,
      [{ name: 'email', type: sql.NVarChar, value: input.email }]
    );

    if (existingCompany.recordset.length > 0) {
      return res.status(400).json({ success: false, error: 'A company with this email already exists' });
    }

    // Generate IDs
    const companyId = generateCompanyId();
    const apiKey = generateApiKey();
    const apiSecret = await hashPassword(generateApiSecret());

    // Calculate next billing date (1st of next month)
    const now = new Date();
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, input.billing_cycle_day || 1);

    // Insert company
    const result = await query<Company>(
      `INSERT INTO companies (
        company_id, name, email, phone, address, city, province, postal_code, country,
        vat_number, contact_person, subscription_plan_id, subscription_status,
        monthly_amount, billing_cycle_day, next_billing_date, api_key, api_secret, notes, is_active
      )
      OUTPUT INSERTED.*
      VALUES (
        @company_id, @name, @email, @phone, @address, @city, @province, @postal_code, @country,
        @vat_number, @contact_person, @subscription_plan_id, 'active',
        @monthly_amount, @billing_cycle_day, @next_billing_date, @api_key, @api_secret, @notes, 1
      )`,
      [
        { name: 'company_id', type: sql.NVarChar, value: companyId },
        { name: 'name', type: sql.NVarChar, value: input.name },
        { name: 'email', type: sql.NVarChar, value: input.email },
        { name: 'phone', type: sql.NVarChar, value: input.phone || null },
        { name: 'address', type: sql.NVarChar, value: input.address || null },
        { name: 'city', type: sql.NVarChar, value: input.city || null },
        { name: 'province', type: sql.NVarChar, value: input.province || null },
        { name: 'postal_code', type: sql.NVarChar, value: input.postal_code || null },
        { name: 'country', type: sql.NVarChar, value: input.country || 'South Africa' },
        { name: 'vat_number', type: sql.NVarChar, value: input.vat_number || null },
        { name: 'contact_person', type: sql.NVarChar, value: input.contact_person || null },
        { name: 'subscription_plan_id', type: sql.Int, value: input.subscription_plan_id || null },
        { name: 'monthly_amount', type: sql.Decimal, value: input.monthly_amount || 0 },
        { name: 'billing_cycle_day', type: sql.Int, value: input.billing_cycle_day || 1 },
        { name: 'next_billing_date', type: sql.Date, value: nextBillingDate },
        { name: 'api_key', type: sql.NVarChar, value: apiKey },
        { name: 'api_secret', type: sql.NVarChar, value: apiSecret },
        { name: 'notes', type: sql.NVarChar, value: input.notes || null },
      ]
    );

    const company = result.recordset[0];

    // Create primary user if credentials provided
    if (input.user_email && input.user_password) {
      const userId = generateUserId();
      const passwordHash = await hashPassword(input.user_password);

      await query(
        `INSERT INTO users (user_id, company_id, email, password_hash, first_name, last_name, role, is_primary, is_active)
         VALUES (@user_id, @company_id, @email, @password_hash, @first_name, @last_name, 'admin', 1, 1)`,
        [
          { name: 'user_id', type: sql.NVarChar, value: userId },
          { name: 'company_id', type: sql.Int, value: company.id },
          { name: 'email', type: sql.NVarChar, value: input.user_email },
          { name: 'password_hash', type: sql.NVarChar, value: passwordHash },
          { name: 'first_name', type: sql.NVarChar, value: input.user_first_name || null },
          { name: 'last_name', type: sql.NVarChar, value: input.user_last_name || null },
        ]
      );
    }

    // Log audit
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, actor_email, new_values)
       VALUES ('company_created', 'company', @entity_id, 'admin', @actor_id, @actor_email, @new_values)`,
      [
        { name: 'entity_id', type: sql.NVarChar, value: companyId },
        { name: 'actor_id', type: sql.NVarChar, value: admin.user_id },
        { name: 'actor_email', type: sql.NVarChar, value: admin.email },
        { name: 'new_values', type: sql.NVarChar, value: JSON.stringify({ name: input.name, email: input.email }) },
      ]
    );

    // Return company with API key visible (only on creation)
    return res.status(201).json({
      success: true,
      data: { ...company, api_key: apiKey },
      message: 'Company created successfully',
    });
  } catch (error: any) {
    console.error('Create company error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create company' });
  }
}

export default withAdminAuth(handler);
