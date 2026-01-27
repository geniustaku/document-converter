// TEMPORARY: Admin password reset endpoint - DELETE AFTER USE
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { secret } = req.body;

  // Simple secret to prevent unauthorized access
  if (secret !== 'reset-admin-2026-docupro') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const newPassword = 'Admin@2026!';
    const hash = await hashPassword(newPassword);

    const result = await query(
      `UPDATE admin_users SET password_hash = @hash, login_attempts = 0, locked_until = NULL WHERE email = @email`,
      [
        { name: 'hash', type: sql.NVarChar, value: hash },
        { name: 'email', type: sql.NVarChar, value: 'accounts@drop-it.tech' },
      ]
    );

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}
