// pages/api/billing/auth/me.ts - Get current user endpoint
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/auth';
import type { ApiResponse, AuthUser } from '@/types/billing';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AuthUser>>,
  user: AuthUser
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
}

export default withAuth(handler);
