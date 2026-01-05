// pages/api/admin/pricing/[id].ts - Update/delete subscription plan
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, SubscriptionPlan } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SubscriptionPlan>>,
  admin: AuthUser
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Plan ID is required' });
  }

  if (req.method === 'GET') {
    return getPlan(res, id as string);
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    return updatePlan(req, res, id as string);
  } else if (req.method === 'DELETE') {
    return deletePlan(res, id as string);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getPlan(
  res: NextApiResponse<ApiResponse<SubscriptionPlan>>,
  id: string
) {
  try {
    const result = await query<SubscriptionPlan>(
      `SELECT * FROM subscription_plans WHERE id = @id`,
      [{ name: 'id', type: sql.Int, value: parseInt(id) }]
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const plan = {
      ...result.recordset[0],
      features: result.recordset[0].features ? JSON.parse(result.recordset[0].features as any) : [],
    };

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    console.error('Get plan error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch plan' });
  }
}

async function updatePlan(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SubscriptionPlan>>,
  id: string
) {
  try {
    const updates: string[] = [];
    const params: { name: string; type: any; value: any }[] = [
      { name: 'id', type: sql.Int, value: parseInt(id) },
    ];

    const fields = [
      { name: 'name', type: sql.NVarChar },
      { name: 'description', type: sql.NVarChar },
      { name: 'price_monthly', type: sql.Decimal },
      { name: 'price_yearly', type: sql.Decimal },
      { name: 'price_lifetime', type: sql.Decimal },
      { name: 'api_calls_limit', type: sql.Int },
      { name: 'sort_order', type: sql.Int },
      { name: 'is_active', type: sql.Bit },
    ];

    for (const field of fields) {
      if (req.body[field.name] !== undefined) {
        updates.push(`${field.name} = @${field.name}`);
        params.push({ name: field.name, type: field.type, value: req.body[field.name] });
      }
    }

    // Handle features separately (needs JSON stringify)
    if (req.body.features !== undefined) {
      updates.push('features = @features');
      params.push({ name: 'features', type: sql.NVarChar, value: JSON.stringify(req.body.features) });
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push('updated_at = GETUTCDATE()');

    const result = await query<SubscriptionPlan>(
      `UPDATE subscription_plans SET ${updates.join(', ')} OUTPUT INSERTED.* WHERE id = @id`,
      params
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const plan = {
      ...result.recordset[0],
      features: result.recordset[0].features ? JSON.parse(result.recordset[0].features as any) : [],
    };

    return res.status(200).json({
      success: true,
      data: plan,
      message: 'Plan updated successfully',
    });
  } catch (error: any) {
    console.error('Update plan error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update plan' });
  }
}

async function deletePlan(
  res: NextApiResponse<ApiResponse>,
  id: string
) {
  try {
    // Check if any companies use this plan
    const companiesResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM companies WHERE subscription_plan_id = @id`,
      [{ name: 'id', type: sql.Int, value: parseInt(id) }]
    );

    if (companiesResult.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete plan: ${companiesResult.recordset[0].count} companies are using this plan`,
      });
    }

    // Soft delete - mark as inactive
    await query(
      `UPDATE subscription_plans SET is_active = 0, updated_at = GETUTCDATE() WHERE id = @id`,
      [{ name: 'id', type: sql.Int, value: parseInt(id) }]
    );

    return res.status(200).json({
      success: true,
      message: 'Plan deactivated successfully',
    });
  } catch (error: any) {
    console.error('Delete plan error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete plan' });
  }
}

export default withAdminAuth(handler);
