// pages/api/billing/auth/logout.ts - User logout endpoint
import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthCookie } from '@/lib/auth';
import type { ApiResponse } from '@/types/billing';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Clear the auth cookie
    clearAuthCookie(res, false);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, error: 'An error occurred during logout' });
  }
}
