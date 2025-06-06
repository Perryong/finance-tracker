/*
  # Create audit logs table for comprehensive logging

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `timestamp` (timestamptz, UTC format)
      - `event_type` (text, event category)
      - `user_id` (uuid, nullable for system events)
      - `session_id` (text, nullable)
      - `action_performed` (text, description of action)
      - `status` (text, result status)
      - `log_level` (text, INFO/WARNING/ERROR/DEBUG)
      - `error_message` (text, nullable)
      - `warning_message` (text, nullable)
      - `transaction_id` (uuid, nullable, references transactions)
      - `source_ip` (inet, IP address)
      - `user_agent` (text, browser/client info)
      - `affected_table` (text, database table affected)
      - `affected_record_id` (uuid, nullable)
      - `before_data` (jsonb, data before change)
      - `after_data` (jsonb, data after change)
      - `metadata` (jsonb, additional context)
      - `request_id` (text, unique request identifier)
      - `execution_time_ms` (integer, operation duration)

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policies for users to read their own logs
    - Add policy for system to insert logs

  3. Indexes
    - Performance indexes for common queries
*/

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_log_level ON audit_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_affected_table ON audit_logs(affected_table);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs(request_id);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;

-- Create policies
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Create function to sanitize sensitive data
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

-- Create function to log events
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