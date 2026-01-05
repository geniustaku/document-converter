// pages/api/admin/companies/[id]/users.ts - Manage company users
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth, generateUserId, hashPassword } from '@/lib/auth';
import { query, sql } from '@/lib/db';
import type { ApiResponse, AuthUser, User } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User | User[]>>,
  admin: AuthUser
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Company ID is required' });
  }

  // Verify company exists
  const companyResult = await query<{ id: number }>(
    `SELECT id FROM companies WHERE id = @id OR company_id = @company_id`,
    [
      { name: 'id', type: sql.Int, value: parseInt(id as string) || 0 },
      { name: 'company_id', type: sql.NVarChar, value: id },
    ]
  );

  if (companyResult.recordset.length === 0) {
    return res.status(404).json({ success: false, error: 'Company not found' });
  }

  const companyId = companyResult.recordset[0].id;

  if (req.method === 'GET') {
    return getUsers(res, companyId);
  } else if (req.method === 'POST') {
    return createUser(req, res, companyId, admin);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getUsers(
  res: NextApiResponse<ApiResponse<User[]>>,
  companyId: number
) {
  try {
    const result = await query<User>(
      `SELECT id, user_id, company_id, email, first_name, last_name, role, is_primary,
              last_login, is_active, created_at, updated_at
       FROM users WHERE company_id = @company_id
       ORDER BY is_primary DESC, created_at ASC`,
      [{ name: 'company_id', type: sql.Int, value: companyId }]
    );

    return res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
}

async function createUser(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>,
  companyId: number,
  admin: AuthUser
) {
  try {
    const { email, password, first_name, last_name, role = 'user', is_primary = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Check if email already exists
    const existingUser = await query<{ id: number }>(
      `SELECT id FROM users WHERE email = @email`,
      [{ name: 'email', type: sql.NVarChar, value: email }]
    );

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }

    const userId = generateUserId();
    const passwordHash = await hashPassword(password);

    // If setting as primary, unset other primary users
    if (is_primary) {
      await query(
        `UPDATE users SET is_primary = 0 WHERE company_id = @company_id`,
        [{ name: 'company_id', type: sql.Int, value: companyId }]
      );
    }

    const result = await query<User>(
      `INSERT INTO users (user_id, company_id, email, password_hash, first_name, last_name, role, is_primary, is_active)
       OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.company_id, INSERTED.email, INSERTED.first_name,
              INSERTED.last_name, INSERTED.role, INSERTED.is_primary, INSERTED.is_active, INSERTED.created_at
       VALUES (@user_id, @company_id, @email, @password_hash, @first_name, @last_name, @role, @is_primary, 1)`,
      [
        { name: 'user_id', type: sql.NVarChar, value: userId },
        { name: 'company_id', type: sql.Int, value: companyId },
        { name: 'email', type: sql.NVarChar, value: email },
        { name: 'password_hash', type: sql.NVarChar, value: passwordHash },
        { name: 'first_name', type: sql.NVarChar, value: first_name || null },
        { name: 'last_name', type: sql.NVarChar, value: last_name || null },
        { name: 'role', type: sql.NVarChar, value: role },
        { name: 'is_primary', type: sql.Bit, value: is_primary },
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.recordset[0],
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create user' });
  }
}

export default withAdminAuth(handler);
