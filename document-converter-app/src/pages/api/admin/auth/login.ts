// pages/api/admin/auth/login.ts - Admin login endpoint
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateAdmin, generateToken, setAuthCookie } from '@/lib/auth';
import type { ApiResponse, AuthUser } from '@/types/billing';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ user: AuthUser; token: string }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const admin = await authenticateAdmin(email, password);

    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({
      sub: admin.admin_id,
      email: admin.email,
      role: admin.role,
      is_admin: true,
    });

    // Set HTTP-only cookie
    setAuthCookie(res, token, true);

    // Build response user object
    const authUser: AuthUser = {
      id: admin.id,
      user_id: admin.admin_id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      is_admin: true,
    };

    return res.status(200).json({
      success: true,
      data: {
        user: authUser,
        token,
      },
      message: 'Admin login successful',
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'An error occurred during login' });
  }
}
