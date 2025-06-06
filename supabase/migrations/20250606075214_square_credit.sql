/*
# Comprehensive Finance Database Schema

This migration creates a complete financial management system with:

1. User Management - Complete user profiles and preferences
2. Enhanced Categories - Hierarchical category system
3. Dashboard Metrics - Real-time financial overview tracking
4. Enhanced Transactions - Full transaction lifecycle with attachments
5. Financial Targets - Goal setting and progress tracking
6. Double-Entry Ledger - Professional accounting system
7. Budget Management - Comprehensive budgeting tools
8. Audit Logging - Complete activity tracking
9. Security - Row Level Security for all tables
10. Performance - Optimized indexes and triggers

## Changes Made:
- Created self-contained user management system
- Enhanced existing transaction and category structures
- Added comprehensive financial tracking capabilities
- Implemented proper security and audit logging
- Added automated business logic and data validation
*/

-- =============================================
-- 1. USER MANAGEMENT
-- =============================================

-- Create profiles table (enhanced from existing)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  date_of_birth date,
  address jsonb DEFAULT '{}',
  account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending_verification')),
  timezone text DEFAULT 'UTC',
  currency text DEFAULT 'USD',
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  language text DEFAULT 'en',
  date_format text DEFAULT 'YYYY-MM-DD',
  number_format text DEFAULT 'en-US',
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT false,
  dashboard_layout jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- 2. CATEGORIES (Enhanced from existing)
-- =============================================

-- Enhance existing categories table
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'description') THEN
    ALTER TABLE categories ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_category_id') THEN
    ALTER TABLE categories ADD COLUMN parent_category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_system') THEN
    ALTER TABLE categories ADD COLUMN is_system boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'is_active') THEN
    ALTER TABLE categories ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- =============================================
-- 3. DASHBOARD METRICS
-- =============================================

-- Create dashboard metrics table for tracking user financial overview
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  metric_date date NOT NULL,
  current_balance decimal(15,2) DEFAULT 0,
  monthly_income decimal(15,2) DEFAULT 0,
  monthly_expenses decimal(15,2) DEFAULT 0,
  monthly_savings decimal(15,2) DEFAULT 0,
  transaction_count integer DEFAULT 0,
  largest_expense decimal(15,2) DEFAULT 0,
  largest_income decimal(15,2) DEFAULT 0,
  top_category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Create dashboard widgets configuration table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  widget_type text NOT NULL,
  widget_config jsonb DEFAULT '{}',
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 1,
  height integer DEFAULT 1,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- 4. ENHANCED TRANSACTIONS
-- =============================================

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'check', 'other')),
  provider text,
  last_four_digits text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhance existing transactions table
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_method_id') THEN
    ALTER TABLE transactions ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
    ALTER TABLE transactions ADD COLUMN status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'reference_number') THEN
    ALTER TABLE transactions ADD COLUMN reference_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'location') THEN
    ALTER TABLE transactions ADD COLUMN location text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'tags') THEN
    ALTER TABLE transactions ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'receipt_url') THEN
    ALTER TABLE transactions ADD COLUMN receipt_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'is_recurring') THEN
    ALTER TABLE transactions ADD COLUMN is_recurring boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'recurring_frequency') THEN
    ALTER TABLE transactions ADD COLUMN recurring_frequency text CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'parent_transaction_id') THEN
    ALTER TABLE transactions ADD COLUMN parent_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create transaction attachments table
CREATE TABLE IF NOT EXISTS transaction_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  file_url text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- 5. FINANCIAL TARGETS
-- =============================================

-- Create financial targets table
CREATE TABLE IF NOT EXISTS financial_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  target_type text NOT NULL CHECK (target_type IN ('savings', 'expense_limit', 'income_goal', 'debt_payoff', 'investment', 'emergency_fund')),
  target_amount decimal(15,2) NOT NULL,
  current_amount decimal(15,2) DEFAULT 0,
  start_date date NOT NULL,
  end_date date,
  category text,
  tracking_frequency text DEFAULT 'monthly' CHECK (tracking_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create target progress tracking table
CREATE TABLE IF NOT EXISTS target_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid REFERENCES financial_targets(id) ON DELETE CASCADE NOT NULL,
  progress_date date NOT NULL,
  amount_contributed decimal(15,2) DEFAULT 0,
  cumulative_amount decimal(15,2) DEFAULT 0,
  percentage_complete decimal(5,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(target_id, progress_date)
);

-- Create target notifications table
CREATE TABLE IF NOT EXISTS target_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id uuid REFERENCES financial_targets(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('milestone', 'deadline', 'off_track', 'completed')),
  trigger_condition jsonb NOT NULL,
  message_template text NOT NULL,
  is_enabled boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- 6. LEDGER ENTRIES (Double-Entry Bookkeeping)
-- =============================================

-- Create account types table
CREATE TABLE IF NOT EXISTS account_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('asset', 'liability', 'equity', 'income', 'expense')),
  normal_balance text NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  description text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_type_id uuid REFERENCES account_types(id) ON DELETE RESTRICT NOT NULL,
  name text NOT NULL,
  account_number text,
  description text,
  current_balance decimal(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create ledger entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  entry_date date NOT NULL,
  reference_number text,
  description text NOT NULL,
  total_amount decimal(15,2) NOT NULL,
  is_balanced boolean DEFAULT false,
  reconciliation_status text DEFAULT 'unreconciled' CHECK (reconciliation_status IN ('unreconciled', 'reconciled', 'disputed')),
  reconciled_at timestamptz,
  reconciled_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ledger entry lines table (for double-entry)
CREATE TABLE IF NOT EXISTS ledger_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_entry_id uuid REFERENCES ledger_entries(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE RESTRICT NOT NULL,
  debit_amount decimal(15,2) DEFAULT 0,
  credit_amount decimal(15,2) DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_debit_or_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR 
    (credit_amount > 0 AND debit_amount = 0)
  )
);

-- =============================================
-- 7. BUDGETS AND BUDGET TRACKING
-- =============================================

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  budget_period text NOT NULL CHECK (budget_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_budget decimal(15,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  category_name text NOT NULL,
  allocated_amount decimal(15,2) NOT NULL,
  spent_amount decimal(15,2) DEFAULT 0,
  remaining_amount decimal(15,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(budget_id, category_name)
);

-- =============================================
-- 8. AUDIT LOGS (Enhanced)
-- =============================================

-- Enhance existing audit_logs table if it exists, otherwise create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    CREATE TABLE audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      timestamp timestamptz DEFAULT now() NOT NULL,
      event_type text NOT NULL,
      user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
      session_id text,
      action_performed text NOT NULL,
      status text NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'PENDING', 'PARTIAL')),
      log_level text NOT NULL CHECK (log_level IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
      error_message text,
      warning_message text,
      transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
      source_ip inet,
      user_agent text,
      affected_table text,
      affected_record_id uuid,
      before_data jsonb,
      after_data jsonb,
      metadata jsonb DEFAULT '{}',
      request_id text,
      execution_time_ms integer,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- =============================================
-- 9. INDEXES FOR PERFORMANCE
-- =============================================

-- User and profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(account_status);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(user_id, type);

-- Dashboard metrics indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_user_date ON dashboard_metrics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets(user_id);

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- Enhanced transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(user_id, is_recurring) WHERE is_recurring = true;

-- Financial targets indexes
CREATE INDEX IF NOT EXISTS idx_financial_targets_user ON financial_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_targets_active ON financial_targets(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_financial_targets_type ON financial_targets(user_id, target_type);
CREATE INDEX IF NOT EXISTS idx_target_progress_target_date ON target_progress(target_id, progress_date DESC);

-- Ledger indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_type ON accounts(user_id, account_type_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_date ON ledger_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_reconciliation ON ledger_entries(reconciliation_status);
CREATE INDEX IF NOT EXISTS idx_ledger_entry_lines_account ON ledger_entry_lines(account_id);

-- Budget indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, budget_period);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget ON budget_categories(budget_id);

-- Audit log indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_log_level ON audit_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_affected_table ON audit_logs(affected_table);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs(request_id);

-- =============================================
-- 10. HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sanitize sensitive data in logs (if not exists)
CREATE OR REPLACE FUNCTION sanitize_log_data(data jsonb)
RETURNS jsonb AS $$
DECLARE
  sanitized jsonb;
  sensitive_fields text[] := ARRAY['password', 'token', 'secret', 'key', 'auth', 'credential'];
  field text;
BEGIN
  sanitized := data;
  
  FOREACH field IN ARRAY sensitive_fields
  LOOP
    IF sanitized ? field THEN
      sanitized := jsonb_set(sanitized, ARRAY[field], '"[REDACTED]"');
    END IF;
  END LOOP;
  
  RETURN sanitized;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log events (if not exists)
CREATE OR REPLACE FUNCTION log_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_action_performed text DEFAULT '',
  p_status text DEFAULT 'SUCCESS',
  p_log_level text DEFAULT 'INFO',
  p_error_message text DEFAULT NULL,
  p_warning_message text DEFAULT NULL,
  p_transaction_id uuid DEFAULT NULL,
  p_source_ip inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_affected_table text DEFAULT NULL,
  p_affected_record_id uuid DEFAULT NULL,
  p_before_data jsonb DEFAULT NULL,
  p_after_data jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_request_id text DEFAULT NULL,
  p_execution_time_ms integer DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
  sanitized_before jsonb;
  sanitized_after jsonb;
  sanitized_metadata jsonb;
BEGIN
  -- Sanitize sensitive data
  sanitized_before := CASE WHEN p_before_data IS NOT NULL THEN sanitize_log_data(p_before_data) ELSE NULL END;
  sanitized_after := CASE WHEN p_after_data IS NOT NULL THEN sanitize_log_data(p_after_data) ELSE NULL END;
  sanitized_metadata := CASE WHEN p_metadata IS NOT NULL THEN sanitize_log_data(p_metadata) ELSE '{}' END;
  
  INSERT INTO audit_logs (
    event_type,
    user_id,
    session_id,
    action_performed,
    status,
    log_level,
    error_message,
    warning_message,
    transaction_id,
    source_ip,
    user_agent,
    affected_table,
    affected_record_id,
    before_data,
    after_data,
    metadata,
    request_id,
    execution_time_ms
  ) VALUES (
    p_event_type,
    p_user_id,
    p_session_id,
    p_action_performed,
    p_status,
    p_log_level,
    p_error_message,
    p_warning_message,
    p_transaction_id,
    p_source_ip,
    p_user_agent,
    p_affected_table,
    p_affected_record_id,
    sanitized_before,
    sanitized_after,
    sanitized_metadata,
    p_request_id,
    p_execution_time_ms
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 11. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage own categories" ON categories;
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Users can manage own dashboard metrics" ON dashboard_metrics;
DROP POLICY IF EXISTS "Users can manage own dashboard widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage own transaction attachments" ON transaction_attachments;
DROP POLICY IF EXISTS "Users can manage own financial targets" ON financial_targets;
DROP POLICY IF EXISTS "Users can manage own target progress" ON target_progress;
DROP POLICY IF EXISTS "Users can manage own target notifications" ON target_notifications;
DROP POLICY IF EXISTS "Users can manage own account types" ON account_types;
DROP POLICY IF EXISTS "Users can manage own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can manage own ledger entries" ON ledger_entries;
DROP POLICY IF EXISTS "Users can manage own ledger entry lines" ON ledger_entry_lines;
DROP POLICY IF EXISTS "Users can manage own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can manage own budget categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

-- Create comprehensive policies
-- Profile policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Category policies
CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Dashboard policies
CREATE POLICY "Users can manage own dashboard metrics" ON dashboard_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own dashboard widgets" ON dashboard_widgets
  FOR ALL USING (auth.uid() = user_id);

-- Payment method policies
CREATE POLICY "Users can manage own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Transaction policies
CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own transaction attachments" ON transaction_attachments
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM transactions WHERE id = transaction_id)
  );

-- Financial target policies
CREATE POLICY "Users can manage own financial targets" ON financial_targets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own target progress" ON target_progress
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM financial_targets WHERE id = target_id)
  );

CREATE POLICY "Users can manage own target notifications" ON target_notifications
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM financial_targets WHERE id = target_id)
  );

-- Account and ledger policies
CREATE POLICY "Users can manage own account types" ON account_types
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ledger entries" ON ledger_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own ledger entry lines" ON ledger_entry_lines
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM ledger_entries WHERE id = ledger_entry_id)
  );

-- Budget policies
CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budget categories" ON budget_categories
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM budgets WHERE id = budget_id)
  );

-- Audit log policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 12. BUSINESS LOGIC FUNCTIONS
-- =============================================

-- Function to update dashboard metrics
CREATE OR REPLACE FUNCTION update_dashboard_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert dashboard metrics for the transaction date
  INSERT INTO dashboard_metrics (user_id, metric_date, current_balance, monthly_income, monthly_expenses, transaction_count)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.date, OLD.date),
    0, 0, 0, 0
  )
  ON CONFLICT (user_id, metric_date) 
  DO UPDATE SET
    monthly_income = CASE 
      WHEN NEW.type = 'income' THEN dashboard_metrics.monthly_income + NEW.amount
      WHEN OLD.type = 'income' AND TG_OP = 'DELETE' THEN dashboard_metrics.monthly_income - OLD.amount
      ELSE dashboard_metrics.monthly_income
    END,
    monthly_expenses = CASE 
      WHEN NEW.type = 'expense' THEN dashboard_metrics.monthly_expenses + ABS(NEW.amount)
      WHEN OLD.type = 'expense' AND TG_OP = 'DELETE' THEN dashboard_metrics.monthly_expenses - ABS(OLD.amount)
      ELSE dashboard_metrics.monthly_expenses
    END,
    transaction_count = CASE 
      WHEN TG_OP = 'INSERT' THEN dashboard_metrics.transaction_count + 1
      WHEN TG_OP = 'DELETE' THEN dashboard_metrics.transaction_count - 1
      ELSE dashboard_metrics.transaction_count
    END,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to validate ledger entry balance
CREATE OR REPLACE FUNCTION validate_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
  total_debits decimal(15,2);
  total_credits decimal(15,2);
BEGIN
  -- Calculate total debits and credits for the ledger entry
  SELECT 
    COALESCE(SUM(debit_amount), 0),
    COALESCE(SUM(credit_amount), 0)
  INTO total_debits, total_credits
  FROM ledger_entry_lines
  WHERE ledger_entry_id = NEW.ledger_entry_id;
  
  -- Update the ledger entry balance status
  UPDATE ledger_entries
  SET 
    is_balanced = (total_debits = total_credits),
    updated_at = now()
  WHERE id = NEW.ledger_entry_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balances
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update account balance based on debit/credit
  UPDATE accounts
  SET 
    current_balance = current_balance + NEW.debit_amount - NEW.credit_amount,
    updated_at = now()
  WHERE id = NEW.account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update target progress
CREATE OR REPLACE FUNCTION update_target_progress()
RETURNS TRIGGER AS $$
DECLARE
  target_record financial_targets%ROWTYPE;
  progress_amount decimal(15,2);
BEGIN
  -- Get target details
  SELECT * INTO target_record
  FROM financial_targets
  WHERE id = NEW.target_id;
  
  -- Calculate progress based on target type
  CASE target_record.target_type
    WHEN 'savings' THEN
      progress_amount := NEW.amount_contributed;
    WHEN 'expense_limit' THEN
      progress_amount := -NEW.amount_contributed; -- Negative for expense limits
    ELSE
      progress_amount := NEW.amount_contributed;
  END CASE;
  
  -- Update target current amount
  UPDATE financial_targets
  SET 
    current_amount = current_amount + progress_amount,
    updated_at = now()
  WHERE id = NEW.target_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to setup default account types for new users
CREATE OR REPLACE FUNCTION setup_default_account_types(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO account_types (user_id, name, category, normal_balance, description, is_system) VALUES
    (user_uuid, 'Cash', 'asset', 'debit', 'Cash and cash equivalents', true),
    (user_uuid, 'Checking Account', 'asset', 'debit', 'Bank checking accounts', true),
    (user_uuid, 'Savings Account', 'asset', 'debit', 'Bank savings accounts', true),
    (user_uuid, 'Credit Card', 'liability', 'credit', 'Credit card accounts', true),
    (user_uuid, 'Income', 'income', 'credit', 'All income sources', true),
    (user_uuid, 'Expenses', 'expense', 'debit', 'All expense categories', true);
END;
$$ LANGUAGE plpgsql;

-- Function to setup default categories for new users
CREATE OR REPLACE FUNCTION setup_default_categories(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, type, is_system) VALUES
    (user_uuid, 'Food', '#ef4444', 'expense', true),
    (user_uuid, 'Transport', '#f97316', 'expense', true),
    (user_uuid, 'Entertainment', '#eab308', 'expense', true),
    (user_uuid, 'Shopping', '#22c55e', 'expense', true),
    (user_uuid, 'Bills', '#3b82f6', 'expense', true),
    (user_uuid, 'Healthcare', '#8b5cf6', 'expense', true),
    (user_uuid, 'Salary', '#10b981', 'income', true),
    (user_uuid, 'Freelance', '#06b6d4', 'income', true),
    (user_uuid, 'Investment', '#8b5cf6', 'income', true)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user data
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Setup default account types
  PERFORM setup_default_account_types(NEW.id);
  
  -- Setup default categories
  PERFORM setup_default_categories(NEW.id);
  
  -- Create default user preferences
  INSERT INTO user_preferences (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default user settings
  INSERT INTO user_settings (user_id, total_savings, theme) VALUES (NEW.id, 0, 'light')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 13. TRIGGERS
-- =============================================

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_dashboard_metrics_updated_at ON dashboard_metrics;
DROP TRIGGER IF EXISTS update_dashboard_widgets_updated_at ON dashboard_widgets;
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_financial_targets_updated_at ON financial_targets;
DROP TRIGGER IF EXISTS update_target_notifications_updated_at ON target_notifications;
DROP TRIGGER IF EXISTS update_account_types_updated_at ON account_types;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
DROP TRIGGER IF EXISTS update_ledger_entries_updated_at ON ledger_entries;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON budget_categories;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS trigger_update_dashboard_metrics ON transactions;
DROP TRIGGER IF EXISTS trigger_validate_ledger_balance ON ledger_entry_lines;
DROP TRIGGER IF EXISTS trigger_update_account_balance ON ledger_entry_lines;
DROP TRIGGER IF EXISTS trigger_update_target_progress ON target_progress;
DROP TRIGGER IF EXISTS trigger_initialize_user_data ON profiles;

-- Updated_at triggers for all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_metrics_updated_at
  BEFORE UPDATE ON dashboard_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_targets_updated_at
  BEFORE UPDATE ON financial_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_notifications_updated_at
  BEFORE UPDATE ON target_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_types_updated_at
  BEFORE UPDATE ON account_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ledger_entries_updated_at
  BEFORE UPDATE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER trigger_update_dashboard_metrics
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_dashboard_metrics();

CREATE TRIGGER trigger_validate_ledger_balance
  AFTER INSERT OR UPDATE ON ledger_entry_lines
  FOR EACH ROW EXECUTE FUNCTION validate_ledger_balance();

CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT ON ledger_entry_lines
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER trigger_update_target_progress
  AFTER INSERT ON target_progress
  FOR EACH ROW EXECUTE FUNCTION update_target_progress();

-- User initialization trigger
CREATE TRIGGER trigger_initialize_user_data
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_data();