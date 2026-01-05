// types/billing.ts - TypeScript types for the billing system

// ============================================
// SUBSCRIPTION PLANS
// ============================================
export type PlanType = 'pay_as_you_go' | 'fixed' | 'lifetime';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  plan_type: PlanType;
  price_monthly: number;
  price_yearly: number;
  price_lifetime: number;
  api_calls_limit: number; // -1 = unlimited
  features: string[]; // Parsed from JSON
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// COMPANIES
// ============================================
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'pending';

export interface Company {
  id: number;
  company_id: string; // e.g., COMP-0001
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string;
  vat_number: string | null;
  contact_person: string | null;

  // Subscription
  subscription_plan_id: number | null;
  subscription_plan?: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  monthly_amount: number;
  billing_cycle_day: number;
  next_billing_date: Date | null;

  // API Access
  api_key: string | null;
  api_secret: string | null;
  api_calls_used: number;
  api_calls_limit: number;

  // Metadata
  notes: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  vat_number?: string;
  contact_person?: string;
  subscription_plan_id?: number;
  monthly_amount?: number;
  billing_cycle_day?: number;
  notes?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  subscription_status?: SubscriptionStatus;
  api_calls_limit?: number;
  is_active?: boolean;
}

// ============================================
// USERS
// ============================================
export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: number;
  user_id: string; // e.g., USR-0001
  company_id: number;
  company?: Company;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  is_primary: boolean;

  // Security
  last_login: Date | null;
  login_attempts: number;
  locked_until: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;

  // Metadata
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  company_id: number;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_primary?: boolean;
}

// ============================================
// ADMIN USERS
// ============================================
export type AdminRole = 'super_admin' | 'admin' | 'billing';

export interface AdminUser {
  id: number;
  admin_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: AdminRole;
  last_login: Date | null;
  login_attempts: number;
  locked_until: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// INVOICES
// ============================================
export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded';

export interface Invoice {
  id: number;
  invoice_number: string; // e.g., INV-2024-0001
  company_id: number;
  company?: Company;

  // Period
  billing_period_start: Date;
  billing_period_end: Date;
  issue_date: Date;
  due_date: Date;

  // Amounts
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  currency: string;

  // Status
  status: InvoiceStatus;

  // Payment
  payment_date: Date | null;
  payment_method: string | null;
  payment_reference: string | null;
  paystack_reference: string | null;

  // Additional
  notes: string | null;
  terms: string | null;
  items?: InvoiceItem[];

  // Metadata
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
  created_at: Date;
}

export interface CreateInvoiceInput {
  company_id: number;
  billing_period_start: Date;
  billing_period_end: Date;
  due_date: Date;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
  vat_rate?: number;
  notes?: string;
  terms?: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceInput {
  status?: InvoiceStatus;
  due_date?: Date;
  notes?: string;
  terms?: string;
  vat_rate?: number;
}

// ============================================
// PAYMENTS
// ============================================
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'paystack' | 'bank_transfer' | 'cash' | 'other';

export interface Payment {
  id: number;
  payment_id: string; // e.g., PAY-XXXX
  invoice_id: number;
  invoice?: Invoice;
  company_id: number;
  company?: Company;

  // Payment Details
  amount: number;
  currency: string;
  payment_method: PaymentMethod;

  // Paystack
  paystack_reference: string | null;
  paystack_transaction_id: string | null;
  paystack_status: string | null;
  paystack_channel: string | null;
  paystack_response: any | null;

  // Status
  status: PaymentStatus;

  // Metadata
  notes: string | null;
  processed_at: Date | null;
  created_at: Date;
}

// ============================================
// API USAGE
// ============================================
export interface ApiUsageLog {
  id: number;
  company_id: number;
  api_key: string;
  endpoint: string;
  method: string;
  request_ip: string | null;
  user_agent: string | null;
  status_code: number | null;
  response_time_ms: number | null;
  credits_used: number;
  is_billable: boolean;
  created_at: Date;
}

export interface MonthlyUsageSummary {
  id: number;
  company_id: number;
  year_month: string; // e.g., 2024-01
  total_api_calls: number;
  total_credits_used: number;
  usage_breakdown: any; // JSON object
  calculated_amount: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// AUTHENTICATION
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expires_at: Date;
}

export interface AuthUser {
  id: number;
  user_id: string;
  email: string;
  name: string;
  role: UserRole | AdminRole;
  company_id?: number;
  company?: Company;
  is_admin: boolean;
}

export interface JWTPayload {
  sub: string; // user_id or admin_id
  email: string;
  role: UserRole | AdminRole;
  company_id?: number;
  is_admin: boolean;
  iat: number;
  exp: number;
}

// ============================================
// API RESPONSES
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================
// PAYSTACK
// ============================================
export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
      customer_code: string;
    };
    authorization: {
      card_type: string;
      last4: string;
      bank: string;
    };
  };
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    metadata: any;
    customer: {
      email: string;
    };
  };
}

// ============================================
// DASHBOARD STATS
// ============================================
export interface DashboardStats {
  total_companies: number;
  active_companies: number;
  total_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  total_revenue: number;
  revenue_this_month: number;
  total_api_calls: number;
  api_calls_this_month: number;
}

export interface CompanyDashboardStats {
  company: Company;
  current_invoice?: Invoice;
  recent_invoices: Invoice[];
  api_usage_this_month: number;
  api_calls_remaining: number;
  total_paid: number;
  outstanding_balance: number;
}
