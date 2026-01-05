// pages/api/billing/auth/login.ts - User login endpoint
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser, generateToken, setAuthCookie } from '@/lib/auth';
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

    const result = await authenticateUser(email, password);

    if (!result) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const { user, company } = result;

    // Check if company subscription is active
    if (company.subscription_status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact accounts@drop-it.tech'
      });
    }

    if (company.subscription_status === 'cancelled') {
      return res.status(403).json({
        success: false,
        error: 'Your subscription has been cancelled. Please contact accounts@drop-it.tech to reactivate'
      });
    }

    // Generate JWT token
    const token = generateToken({
      sub: user.user_id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      is_admin: false,
    });

    // Set HTTP-only cookie
    setAuthCookie(res, token, false);

    // Build response user object
    const authUser: AuthUser = {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      role: user.role,
      company_id: user.company_id,
      company: company,
      is_admin: false,
    };

    return res.status(200).json({
      success: true,
      data: {
        user: authUser,
        token,
      },
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'An error occurred during login' });
  }
}
