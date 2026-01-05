-- ============================================
-- Document Converter Pro - Billing System Schema
-- Azure SQL Database
-- ============================================

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- Stores different pricing tiers
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='subscription_plans' AND xtype='U')
CREATE TABLE subscription_plans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    slug NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(500),
    plan_type NVARCHAR(20) NOT NULL CHECK (plan_type IN ('pay_as_you_go', 'fixed', 'lifetime')),
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    price_lifetime DECIMAL(10,2) DEFAULT 0,
    api_calls_limit INT DEFAULT -1, -- -1 means unlimited
    features NVARCHAR(MAX), -- JSON array of features
    is_active BIT DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- COMPANIES TABLE
-- Stores client company information
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='companies' AND xtype='U')
CREATE TABLE companies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    company_id NVARCHAR(50) NOT NULL UNIQUE, -- Auto-generated unique ID (e.g., COMP-XXXX)
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    phone NVARCHAR(50),
    address NVARCHAR(500),
    city NVARCHAR(100),
    province NVARCHAR(100),
    postal_code NVARCHAR(20),
    country NVARCHAR(100) DEFAULT 'South Africa',
    vat_number NVARCHAR(50),
    contact_person NVARCHAR(255),

    -- Subscription Details
    subscription_plan_id INT FOREIGN KEY REFERENCES subscription_plans(id),
    subscription_status NVARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'pending')),
    monthly_amount DECIMAL(10,2) DEFAULT 0, -- Custom amount set by admin
    billing_cycle_day INT DEFAULT 1, -- Day of month for billing (1-28)
    next_billing_date DATE,

    -- API Access
    api_key NVARCHAR(64) UNIQUE, -- Auto-generated secure API key
    api_secret NVARCHAR(128), -- Hashed secret for API auth
    api_calls_used INT DEFAULT 0,
    api_calls_limit INT DEFAULT -1, -- -1 means use plan limit

    -- Metadata
    notes NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- USERS TABLE
-- Stores login credentials for company users
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL UNIQUE, -- Auto-generated unique ID (e.g., USR-XXXX)
    company_id INT FOREIGN KEY REFERENCES companies(id) ON DELETE CASCADE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    role NVARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_primary BIT DEFAULT 0, -- Primary contact for the company

    -- Security
    last_login DATETIME2,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME2,
    password_reset_token NVARCHAR(255),
    password_reset_expires DATETIME2,

    -- Metadata
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- ADMIN USERS TABLE
-- Stores admin login credentials (separate from company users)
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_users' AND xtype='U')
CREATE TABLE admin_users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    admin_id NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'billing')),

    -- Security
    last_login DATETIME2,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME2,

    -- Metadata
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- INVOICES TABLE
-- Stores all invoices for companies
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='invoices' AND xtype='U')
CREATE TABLE invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_number NVARCHAR(50) NOT NULL UNIQUE, -- Format: INV-2024-0001
    company_id INT NOT NULL FOREIGN KEY REFERENCES companies(id),

    -- Invoice Period
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CAST(GETUTCDATE() AS DATE),
    due_date DATE NOT NULL,

    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5,2) DEFAULT 15.00,
    vat_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency NVARCHAR(3) DEFAULT 'ZAR',

    -- Status
    status NVARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')),

    -- Payment Details
    payment_date DATETIME2,
    payment_method NVARCHAR(50),
    payment_reference NVARCHAR(255),
    paystack_reference NVARCHAR(255),

    -- Additional Info
    notes NVARCHAR(MAX),
    terms NVARCHAR(MAX),

    -- Metadata
    created_by INT, -- Admin who created it
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- INVOICE ITEMS TABLE
-- Line items for each invoice
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='invoice_items' AND xtype='U')
CREATE TABLE invoice_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT NOT NULL FOREIGN KEY REFERENCES invoices(id) ON DELETE CASCADE,
    description NVARCHAR(500) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- PAYMENTS TABLE
-- Records all payment transactions
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    payment_id NVARCHAR(50) NOT NULL UNIQUE, -- Auto-generated (PAY-XXXX)
    invoice_id INT NOT NULL FOREIGN KEY REFERENCES invoices(id),
    company_id INT NOT NULL FOREIGN KEY REFERENCES companies(id),

    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    currency NVARCHAR(3) DEFAULT 'ZAR',
    payment_method NVARCHAR(50) NOT NULL, -- paystack, bank_transfer, cash, etc.

    -- Paystack Details
    paystack_reference NVARCHAR(255),
    paystack_transaction_id NVARCHAR(255),
    paystack_status NVARCHAR(50),
    paystack_channel NVARCHAR(50), -- card, bank, ussd, etc.
    paystack_response NVARCHAR(MAX), -- Full JSON response

    -- Status
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded', 'cancelled')),

    -- Metadata
    notes NVARCHAR(MAX),
    processed_at DATETIME2,
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- ============================================
-- API USAGE LOGS TABLE
-- Tracks API calls for billing and analytics
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='api_usage_logs' AND xtype='U')
CREATE TABLE api_usage_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL FOREIGN KEY REFERENCES companies(id),
    api_key NVARCHAR(64) NOT NULL,

    -- Request Details
    endpoint NVARCHAR(255) NOT NULL,
    method NVARCHAR(10) NOT NULL,
    request_ip NVARCHAR(45),
    user_agent NVARCHAR(500),

    -- Response Details
    status_code INT,
    response_time_ms INT,

    -- Billing
    credits_used INT DEFAULT 1,
    is_billable BIT DEFAULT 1,

    -- Metadata
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Create index for fast queries on api_usage_logs
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_usage_company_date')
    CREATE INDEX idx_api_usage_company_date ON api_usage_logs(company_id, created_at);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_usage_api_key')
    CREATE INDEX idx_api_usage_api_key ON api_usage_logs(api_key);

-- ============================================
-- MONTHLY USAGE SUMMARY TABLE
-- Aggregated usage per company per month
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='monthly_usage_summary' AND xtype='U')
CREATE TABLE monthly_usage_summary (
    id INT IDENTITY(1,1) PRIMARY KEY,
    company_id INT NOT NULL FOREIGN KEY REFERENCES companies(id),
    year_month NVARCHAR(7) NOT NULL, -- Format: 2024-01

    -- Usage Stats
    total_api_calls INT DEFAULT 0,
    total_credits_used INT DEFAULT 0,

    -- Breakdown by endpoint (JSON)
    usage_breakdown NVARCHAR(MAX),

    -- Billing
    calculated_amount DECIMAL(10,2) DEFAULT 0,

    -- Metadata
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_company_month UNIQUE (company_id, year_month)
);

-- ============================================
-- AUDIT LOG TABLE
-- Tracks important actions for security
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='audit_logs' AND xtype='U')
CREATE TABLE audit_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(50), -- company, invoice, user, etc.
    entity_id NVARCHAR(50),

    -- Actor
    actor_type NVARCHAR(20), -- admin, user, system
    actor_id NVARCHAR(50),
    actor_email NVARCHAR(255),

    -- Details
    old_values NVARCHAR(MAX), -- JSON
    new_values NVARCHAR(MAX), -- JSON
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),

    -- Metadata
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_entity')
    CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_actor')
    CREATE INDEX idx_audit_actor ON audit_logs(actor_type, actor_id);

-- ============================================
-- INSERT DEFAULT SUBSCRIPTION PLANS
-- ============================================
IF NOT EXISTS (SELECT * FROM subscription_plans WHERE slug = 'pay_as_you_go')
INSERT INTO subscription_plans (name, slug, description, plan_type, price_monthly, api_calls_limit, features, sort_order)
VALUES
    ('Pay As You Go', 'pay_as_you_go', 'Pay only for what you use. Perfect for occasional users.', 'pay_as_you_go', 0, -1, '["Unlimited API calls", "Pay per conversion", "Email support", "API documentation"]', 1),
    ('Starter', 'starter', 'Great for small businesses getting started.', 'fixed', 499.00, 1000, '["1,000 API calls/month", "Email support", "API documentation", "Basic analytics"]', 2),
    ('Professional', 'professional', 'For growing businesses with regular needs.', 'fixed', 1499.00, 5000, '["5,000 API calls/month", "Priority support", "Advanced analytics", "Webhook notifications"]', 3),
    ('Enterprise', 'enterprise', 'For large organizations with high volume.', 'fixed', 4999.00, 25000, '["25,000 API calls/month", "24/7 Priority support", "Custom integrations", "Dedicated account manager"]', 4),
    ('Lifetime', 'lifetime', 'One-time payment for lifetime access.', 'lifetime', 0, -1, '["Unlimited API calls", "Lifetime access", "All future updates", "Priority support"]', 5);

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- Email: accounts@drop-it.tech
-- ============================================
IF NOT EXISTS (SELECT * FROM admin_users WHERE email = 'accounts@drop-it.tech')
INSERT INTO admin_users (admin_id, email, password_hash, name, role)
VALUES ('ADM-0001', 'accounts@drop-it.tech', '$2b$12$dY2dC56mEL0emSfdNMdQLeyRjlbW2xv3gvT2q66BTwo9dEMApgXlG', 'System Administrator', 'super_admin');

-- ============================================
-- STORED PROCEDURE: Generate Invoice Number
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_generate_invoice_number')
    DROP PROCEDURE sp_generate_invoice_number;
GO

CREATE PROCEDURE sp_generate_invoice_number
AS
BEGIN
    DECLARE @year NVARCHAR(4) = CAST(YEAR(GETUTCDATE()) AS NVARCHAR(4));
    DECLARE @sequence INT;
    DECLARE @invoice_number NVARCHAR(50);

    SELECT @sequence = ISNULL(MAX(CAST(RIGHT(invoice_number, 4) AS INT)), 0) + 1
    FROM invoices
    WHERE invoice_number LIKE 'INV-' + @year + '-%';

    SET @invoice_number = 'INV-' + @year + '-' + RIGHT('0000' + CAST(@sequence AS NVARCHAR(4)), 4);

    SELECT @invoice_number AS invoice_number;
END;
GO

-- ============================================
-- STORED PROCEDURE: Generate Company ID
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_generate_company_id')
    DROP PROCEDURE sp_generate_company_id;
GO

CREATE PROCEDURE sp_generate_company_id
AS
BEGIN
    DECLARE @sequence INT;
    DECLARE @company_id NVARCHAR(50);

    SELECT @sequence = ISNULL(MAX(CAST(RIGHT(company_id, 4) AS INT)), 0) + 1
    FROM companies;

    SET @company_id = 'COMP-' + RIGHT('0000' + CAST(@sequence AS NVARCHAR(4)), 4);

    SELECT @company_id AS company_id;
END;
GO

-- ============================================
-- STORED PROCEDURE: Generate API Key
-- ============================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_generate_api_key')
    DROP PROCEDURE sp_generate_api_key;
GO

CREATE PROCEDURE sp_generate_api_key
AS
BEGIN
    DECLARE @api_key NVARCHAR(64);
    SET @api_key = 'dcp_' + LOWER(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', '')) + LOWER(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', ''));
    SET @api_key = LEFT(@api_key, 64);
    SELECT @api_key AS api_key;
END;
GO

PRINT 'Database schema created successfully!';
