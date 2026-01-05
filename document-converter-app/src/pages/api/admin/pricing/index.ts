// pages/api/admin/pricing/index.ts - Manage subscription plans
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, SubscriptionPlan } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SubscriptionPlan | SubscriptionPlan[]>>,
  admin: AuthUser
) {
  if (req.method === 'GET') {
    return getPlans(req, res);
  } else if (req.method === 'POST') {
    return createPlan(req, res, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getPlans(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SubscriptionPlan[]>>
) {
  try {
    const { include_inactive } = req.query;

    let whereClause = include_inactive === 'true' ? '1=1' : 'is_active = 1';

    const result = await query<SubscriptionPlan>(
      `SELECT * FROM subscription_plans WHERE ${whereClause} ORDER BY sort_order, id`,
      []
    );

    // Parse features JSON
    const plans = result.recordset.map(plan => ({
      ...plan,
      features: plan.features ? JSON.parse(plan.features as any) : [],
    }));

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    console.error('Get plans error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
}

async function createPlan(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SubscriptionPlan>>,
  admin: AuthUser
) {
  try {
    const {
      name,
      slug,
      description,
      plan_type,
      price_monthly,
      price_yearly,
      price_lifetime,
      api_calls_limit,
      features,
      sort_order,
    } = req.body;

    if (!name || !slug || !plan_type) {
      return res.status(400).json({ success: false, error: 'Name, slug, and plan type are required' });
    }

    // Check if slug exists
    const existingPlan = await query<{ id: number }>(
      `SELECT id FROM subscription_plans WHERE slug = @slug`,
      [{ name: 'slug', type: sql.NVarChar, value: slug }]
    );

    if (existingPlan.recordset.length > 0) {
      return res.status(400).json({ success: false, error: 'A plan with this slug already exists' });
    }

    const result = await query<SubscriptionPlan>(
      `INSERT INTO subscription_plans (
        name, slug, description, plan_type, price_monthly, price_yearly,
        price_lifetime, api_calls_limit, features, sort_order, is_active
      )
      OUTPUT INSERTED.*
      VALUES (
        @name, @slug, @description, @plan_type, @price_monthly, @price_yearly,
        @price_lifetime, @api_calls_limit, @features, @sort_order, 1
      )`,
      [
        { name: 'name', type: sql.NVarChar, value: name },
        { name: 'slug', type: sql.NVarChar, value: slug },
        { name: 'description', type: sql.NVarChar, value: description || null },
        { name: 'plan_type', type: sql.NVarChar, value: plan_type },
        { name: 'price_monthly', type: sql.Decimal, value: price_monthly || 0 },
        { name: 'price_yearly', type: sql.Decimal, value: price_yearly || 0 },
        { name: 'price_lifetime', type: sql.Decimal, value: price_lifetime || 0 },
        { name: 'api_calls_limit', type: sql.Int, value: api_calls_limit ?? -1 },
        { name: 'features', type: sql.NVarChar, value: JSON.stringify(features || []) },
        { name: 'sort_order', type: sql.Int, value: sort_order || 0 },
      ]
    );

    const plan = {
      ...result.recordset[0],
      features: features || [],
    };

    return res.status(201).json({
      success: true,
      data: plan,
      message: 'Plan created successfully',
    });
  } catch (error: any) {
    console.error('Create plan error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create plan' });
  }
}

export default withAdminAuth(handler);
