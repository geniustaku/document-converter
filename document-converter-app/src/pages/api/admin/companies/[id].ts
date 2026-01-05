// pages/api/admin/companies/[id].ts - Get, update, delete single company
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, generateApiKey, hashPassword } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, Company, UpdateCompanyInput } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Company>>,
  admin: AuthUser
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Company ID is required' });
  }

  if (req.method === 'GET') {
    return getCompany(req, res, id as string);
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    return updateCompany(req, res, id as string, admin);
  } else if (req.method === 'DELETE') {
    return deleteCompany(req, res, id as string, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getCompany(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Company>>,
  id: string
) {
  try {
    // Support both numeric ID and company_id (COMP-XXXX)
    const isNumeric = /^\d+$/.test(id);

    const result = await query<Company>(
      `SELECT c.*, sp.name as plan_name, sp.slug as plan_slug, sp.plan_type,
              (SELECT COUNT(*) FROM invoices WHERE company_id = c.id) as invoice_count,
              (SELECT SUM(total_amount) FROM invoices WHERE company_id = c.id AND status = 'paid') as total_paid,
              (SELECT SUM(balance_due) FROM invoices WHERE company_id = c.id AND status IN ('pending', 'sent', 'overdue')) as outstanding_balance
       FROM companies c
       LEFT JOIN subscription_plans sp ON c.subscription_plan_id = sp.id
       WHERE ${isNumeric ? 'c.id = @id' : 'c.company_id = @id'}`,
      [{ name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id) : id }]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // Get users for this company
    const usersResult = await query<any>(
      `SELECT id, user_id, email, first_name, last_name, role, is_primary, last_login, is_active, created_at
       FROM users WHERE company_id = @company_id`,
      [{ name: 'company_id', type: sql.Int, value: result.recordset[0].id }]
    );

    const company = {
      ...result.recordset[0],
      users: usersResult.recordset,
    };

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error('Get company error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch company' });
  }
}

async function updateCompany(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Company>>,
  id: string,
  admin: AuthUser
) {
  try {
    const isNumeric = /^\d+$/.test(id);
    const input: UpdateCompanyInput & { regenerate_api_key?: boolean } = req.body;

    // Get current company data for audit log
    const currentResult = await query<Company>(
      `SELECT * FROM companies WHERE ${isNumeric ? 'id = @id' : 'company_id = @id'}`,
      [{ name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id) : id }]
    );

    if (currentResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const currentCompany = currentResult.recordset[0];

    // Build update query dynamically
    const updates: string[] = [];
    const params: { name: string; type: any; value: any }[] = [
      { name: 'id', type: sql.Int, value: currentCompany.id },
    ];

    const fieldsToUpdate = [
      'name', 'email', 'phone', 'address', 'city', 'province', 'postal_code',
      'country', 'vat_number', 'contact_person', 'subscription_plan_id',
      'subscription_status', 'monthly_amount', 'billing_cycle_day', 'api_calls_limit',
      'notes', 'is_active'
    ];

    for (const field of fieldsToUpdate) {
      if (input[field as keyof UpdateCompanyInput] !== undefined) {
        updates.push(`${field} = @${field}`);
        let type: any = sql.NVarChar;
        if (field === 'subscription_plan_id' || field === 'billing_cycle_day' || field === 'api_calls_limit') {
          type = sql.Int;
        } else if (field === 'monthly_amount') {
          type = sql.Decimal;
        } else if (field === 'is_active') {
          type = sql.Bit;
        }
        params.push({ name: field, type, value: input[field as keyof UpdateCompanyInput] });
      }
    }

    // Regenerate API key if requested
    if (input.regenerate_api_key) {
      const newApiKey = generateApiKey();
      updates.push('api_key = @api_key');
      params.push({ name: 'api_key', type: sql.NVarChar, value: newApiKey });
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push('updated_at = GETUTCDATE()');

    const result = await query<Company>(
      `UPDATE companies SET ${updates.join(', ')} OUTPUT INSERTED.* WHERE id = @id`,
      params
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, actor_email, old_values, new_values)
       VALUES ('company_updated', 'company', @entity_id, 'admin', @actor_id, @actor_email, @old_values, @new_values)`,
      [
        { name: 'entity_id', type: sql.NVarChar, value: currentCompany.company_id },
        { name: 'actor_id', type: sql.NVarChar, value: admin.user_id },
        { name: 'actor_email', type: sql.NVarChar, value: admin.email },
        { name: 'old_values', type: sql.NVarChar, value: JSON.stringify(currentCompany) },
        { name: 'new_values', type: sql.NVarChar, value: JSON.stringify(input) },
      ]
    );

    return res.status(200).json({
      success: true,
      data: result.recordset[0],
      message: 'Company updated successfully',
    });
  } catch (error: any) {
    console.error('Update company error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update company' });
  }
}

async function deleteCompany(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  id: string,
  admin: AuthUser
) {
  try {
    const isNumeric = /^\d+$/.test(id);

    // Get company for audit log
    const currentResult = await query<Company>(
      `SELECT * FROM companies WHERE ${isNumeric ? 'id = @id' : 'company_id = @id'}`,
      [{ name: 'id', type: isNumeric ? sql.Int : sql.NVarChar, value: isNumeric ? parseInt(id) : id }]
    );

    if (currentResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const company = currentResult.recordset[0];

    // Soft delete - just mark as inactive
    await query(
      `UPDATE companies SET is_active = 0, subscription_status = 'cancelled', updated_at = GETUTCDATE() WHERE id = @id`,
      [{ name: 'id', type: sql.Int, value: company.id }]
    );

    // Deactivate all users
    await query(
      `UPDATE users SET is_active = 0, updated_at = GETUTCDATE() WHERE company_id = @company_id`,
      [{ name: 'company_id', type: sql.Int, value: company.id }]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_type, actor_id, actor_email, old_values)
       VALUES ('company_deleted', 'company', @entity_id, 'admin', @actor_id, @actor_email, @old_values)`,
      [
        { name: 'entity_id', type: sql.NVarChar, value: company.company_id },
        { name: 'actor_id', type: sql.NVarChar, value: admin.user_id },
        { name: 'actor_email', type: sql.NVarChar, value: admin.email },
        { name: 'old_values', type: sql.NVarChar, value: JSON.stringify({ name: company.name, email: company.email }) },
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete company error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete company' });
  }
}

export default withAdminAuth(handler);
