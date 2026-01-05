// lib/auth.ts - Authentication utilities
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { query, sql } from './db';
import type { JWTPayload, AuthUser, User, AdminUser } from '@/types/billing';

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// ============================================
// PASSWORD UTILITIES
// ============================================
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT UTILITIES
// ============================================
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// ============================================
// COOKIE UTILITIES
// ============================================
export function setAuthCookie(res: NextApiResponse, token: string, isAdmin: boolean = false): void {
  const cookieName = isAdmin ? 'admin_token' : 'auth_token';
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

  res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`);
}

export function clearAuthCookie(res: NextApiResponse, isAdmin: boolean = false): void {
  const cookieName = isAdmin ? 'admin_token' : 'auth_token';
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

export function getTokenFromRequest(req: NextApiRequest, isAdmin: boolean = false): string | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const cookieName = isAdmin ? 'admin_token' : 'auth_token';
  const cookies = req.cookies;
  if (cookies && cookies[cookieName]) {
    return cookies[cookieName];
  }

  return null;
}

// ============================================
// AUTH MIDDLEWARE
// ============================================
export type AuthenticatedHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: AuthUser
) => Promise<void>;

export function withAuth(handler: AuthenticatedHandler, adminOnly: boolean = false) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = getTokenFromRequest(req, adminOnly);

      if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
      }

      // If admin only, verify it's an admin
      if (adminOnly && !payload.is_admin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      // Build auth user object
      const authUser: AuthUser = {
        id: parseInt(payload.sub.split('-')[1]) || 0,
        user_id: payload.sub,
        email: payload.email,
        name: payload.email, // Will be overwritten if needed
        role: payload.role,
        company_id: payload.company_id,
        is_admin: payload.is_admin,
      };

      // Get additional user details if needed
      if (!payload.is_admin && payload.company_id) {
        const companyResult = await query<any>(
          `SELECT c.*, sp.name as plan_name, sp.slug as plan_slug
           FROM companies c
           LEFT JOIN subscription_plans sp ON c.subscription_plan_id = sp.id
           WHERE c.id = @company_id`,
          [{ name: 'company_id', type: sql.Int, value: payload.company_id }]
        );
        if (companyResult.recordset.length > 0) {
          authUser.company = companyResult.recordset[0];
        }
      }

      return handler(req, res, authUser);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ success: false, error: 'Authentication failed' });
    }
  };
}

// Admin-only middleware wrapper
export function withAdminAuth(handler: AuthenticatedHandler) {
  return withAuth(handler, true);
}

// ============================================
// USER AUTHENTICATION
// ============================================
export async function authenticateUser(email: string, password: string): Promise<{ user: User; company: any } | null> {
  try {
    const result = await query<User & { company_name: string }>(
      `SELECT u.*, c.name as company_name, c.company_id as company_code, c.subscription_status
       FROM users u
       INNER JOIN companies c ON u.company_id = c.id
       WHERE u.email = @email AND u.is_active = 1 AND c.is_active = 1`,
      [{ name: 'email', type: sql.NVarChar, value: email }]
    );

    if (result.recordset.length === 0) {
      return null;
    }

    const user = result.recordset[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      // Increment login attempts
      await query(
        `UPDATE users SET login_attempts = login_attempts + 1,
         locked_until = CASE WHEN login_attempts >= 4 THEN DATEADD(minute, 30, GETUTCDATE()) ELSE NULL END
         WHERE id = @id`,
        [{ name: 'id', type: sql.Int, value: user.id }]
      );
      return null;
    }

    // Reset login attempts and update last login
    await query(
      `UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = GETUTCDATE() WHERE id = @id`,
      [{ name: 'id', type: sql.Int, value: user.id }]
    );

    // Get company details
    const companyResult = await query<any>(
      `SELECT c.*, sp.name as plan_name, sp.slug as plan_slug, sp.plan_type
       FROM companies c
       LEFT JOIN subscription_plans sp ON c.subscription_plan_id = sp.id
       WHERE c.id = @company_id`,
      [{ name: 'company_id', type: sql.Int, value: user.company_id }]
    );

    return {
      user,
      company: companyResult.recordset[0] || null,
    };
  } catch (error) {
    console.error('User authentication error:', error);
    return null;
  }
}

// ============================================
// ADMIN AUTHENTICATION
// ============================================
export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    const result = await query<AdminUser>(
      `SELECT * FROM admin_users WHERE email = @email AND is_active = 1`,
      [{ name: 'email', type: sql.NVarChar, value: email }]
    );

    if (result.recordset.length === 0) {
      return null;
    }

    const admin = result.recordset[0];

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      // Increment login attempts
      await query(
        `UPDATE admin_users SET login_attempts = login_attempts + 1,
         locked_until = CASE WHEN login_attempts >= 4 THEN DATEADD(minute, 30, GETUTCDATE()) ELSE NULL END
         WHERE id = @id`,
        [{ name: 'id', type: sql.Int, value: admin.id }]
      );
      return null;
    }

    // Reset login attempts and update last login
    await query(
      `UPDATE admin_users SET login_attempts = 0, locked_until = NULL, last_login = GETUTCDATE() WHERE id = @id`,
      [{ name: 'id', type: sql.Int, value: admin.id }]
    );

    return admin;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

// ============================================
// GENERATE IDS
// ============================================
export function generateUserId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `USR-${timestamp}${random}`;
}

export function generateCompanyId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `COMP-${timestamp}${random}`;
}

export function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'dcp_';
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function generateApiSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  for (let i = 0; i < 64; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function generatePaymentId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}${random}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await query<{ max_seq: number }>(
    `SELECT ISNULL(MAX(CAST(RIGHT(invoice_number, 4) AS INT)), 0) + 1 as max_seq
     FROM invoices
     WHERE invoice_number LIKE @pattern`,
    [{ name: 'pattern', type: sql.NVarChar, value: `INV-${year}-%` }]
  );
  const sequence = result.recordset[0]?.max_seq || 1;
  return `INV-${year}-${sequence.toString().padStart(4, '0')}`;
}
