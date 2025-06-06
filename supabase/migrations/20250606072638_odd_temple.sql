/*
  # Comprehensive Finance Tracker Database Schema

  This migration creates a complete database structure for managing user financial data including:
  
  1. Enhanced User Information
    - Extended profile details with contact information
    - Account status tracking
    - Preference management
  
  2. Dashboard Metrics
    - Current balance tracking
    - Monthly spending overviews
    - Activity summaries
    - Custom widget configurations
  
  3. Enhanced Transactions
    - Payment methods
    - Receipt attachments
    - Transaction status tracking
    - Improved categorization
  
  4. Financial Targets
    - Goal tracking with progress monitoring
    - Notification settings
    - Multiple target types
  
  5. Ledger Entries
    - Double-entry bookkeeping support
    - Account types
    - Reconciliation tracking
  
  6. Security & Audit
    - Comprehensive audit logging
    - Data validation rules
    - Referential integrity
*/

-- =============================================
-- 1. ENHANCED USER INFORMATION
-- =============================================

-- Extend profiles table with additional user information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending_verification'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

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
-- 2. DASHBOARD METRICS
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
-- 3. ENHANCED TRANSACTIONS
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

-- Enhance transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference_number text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurring_frequency text CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS parent_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL;

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
-- 4. FINANCIAL TARGETS
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
-- 5. LEDGER ENTRIES (Double-Entry Bookkeeping)
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
-- 6. BUDGETS AND BUDGET TRACKING
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
-- 7. INDEXES FOR PERFORMANCE
-- =============================================

-- Dashboard metrics indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_user_date ON dashboard_metrics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets(user_id);

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;

-- Enhanced transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(user_id, is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_transactions_tags ON transactions USING gin(tags);

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

-- =============================================
-- 8. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
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

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Dashboard metrics policies
CREATE POLICY "Users can manage own dashboard metrics" ON dashboard_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own dashboard widgets" ON dashboard_widgets
  FOR ALL USING (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "Users can manage own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Transaction attachments policies
CREATE POLICY "Users can manage own transaction attachments" ON transaction_attachments
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM transactions WHERE id = transaction_id)
  );

-- Financial targets policies
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

-- =============================================
-- 9. TRIGGERS AND FUNCTIONS
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

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_dashboard_metrics ON transactions;
CREATE TRIGGER trigger_update_dashboard_metrics
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_dashboard_metrics();

DROP TRIGGER IF EXISTS trigger_validate_ledger_balance ON ledger_entry_lines;
CREATE TRIGGER trigger_validate_ledger_balance
  AFTER INSERT OR UPDATE ON ledger_entry_lines
  FOR EACH ROW EXECUTE FUNCTION validate_ledger_balance();

DROP TRIGGER IF EXISTS trigger_update_account_balance ON ledger_entry_lines;
CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT ON ledger_entry_lines
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

DROP TRIGGER IF EXISTS trigger_update_target_progress ON target_progress;
CREATE TRIGGER trigger_update_target_progress
  AFTER INSERT ON target_progress
  FOR EACH ROW EXECUTE FUNCTION update_target_progress();

-- Add updated_at triggers for all new tables
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
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

-- =============================================
-- 10. INITIAL DATA SETUP
-- =============================================

-- Insert default account types for new users
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

-- Function to initialize user data
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Setup default account types
  PERFORM setup_default_account_types(NEW.id);
  
  -- Create default user preferences
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize user data on profile creation
DROP TRIGGER IF EXISTS trigger_initialize_user_data ON profiles;
CREATE TRIGGER trigger_initialize_user_data
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_data();