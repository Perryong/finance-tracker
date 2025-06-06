export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          address: Json
          account_status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          timezone: string
          currency: string
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: Json
          account_status?: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          timezone?: string
          currency?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          address?: Json
          account_status?: 'active' | 'inactive' | 'suspended' | 'pending_verification'
          timezone?: string
          currency?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          language: string
          date_format: string
          number_format: string
          notifications_enabled: boolean
          email_notifications: boolean
          push_notifications: boolean
          dashboard_layout: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          language?: string
          date_format?: string
          number_format?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          dashboard_layout?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          language?: string
          date_format?: string
          number_format?: string
          notifications_enabled?: boolean
          email_notifications?: boolean
          push_notifications?: boolean
          dashboard_layout?: Json
          created_at?: string
          updated_at?: string
        }
      }
      dashboard_metrics: {
        Row: {
          id: string
          user_id: string
          metric_date: string
          current_balance: number
          monthly_income: number
          monthly_expenses: number
          monthly_savings: number
          transaction_count: number
          largest_expense: number
          largest_income: number
          top_category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_date: string
          current_balance?: number
          monthly_income?: number
          monthly_expenses?: number
          monthly_savings?: number
          transaction_count?: number
          largest_expense?: number
          largest_income?: number
          top_category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_date?: string
          current_balance?: number
          monthly_income?: number
          monthly_expenses?: number
          monthly_savings?: number
          transaction_count?: number
          largest_expense?: number
          largest_income?: number
          top_category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dashboard_widgets: {
        Row: {
          id: string
          user_id: string
          widget_type: string
          widget_config: Json
          position_x: number
          position_y: number
          width: number
          height: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          widget_type: string
          widget_config?: Json
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          widget_type?: string
          widget_config?: Json
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'check' | 'other'
          provider: string | null
          last_four_digits: string | null
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'check' | 'other'
          provider?: string | null
          last_four_digits?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'check' | 'other'
          provider?: string | null
          last_four_digits?: string | null
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          date: string
          notes: string | null
          type: 'income' | 'expense'
          payment_method_id: string | null
          status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          reference_number: string | null
          location: string | null
          tags: string[]
          receipt_url: string | null
          is_recurring: boolean
          recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          parent_transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          date: string
          notes?: string | null
          type: 'income' | 'expense'
          payment_method_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          reference_number?: string | null
          location?: string | null
          tags?: string[]
          receipt_url?: string | null
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          parent_transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          date?: string
          notes?: string | null
          type?: 'income' | 'expense'
          payment_method_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
          reference_number?: string | null
          location?: string | null
          tags?: string[]
          receipt_url?: string | null
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          parent_transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transaction_attachments: {
        Row: {
          id: string
          transaction_id: string
          file_name: string
          file_type: string
          file_size: number | null
          file_url: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          file_name: string
          file_type: string
          file_size?: number | null
          file_url: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          file_name?: string
          file_type?: string
          file_size?: number | null
          file_url?: string
          description?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          type: 'income' | 'expense'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          type: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
      }
      financial_targets: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_type: 'savings' | 'expense_limit' | 'income_goal' | 'debt_payoff' | 'investment' | 'emergency_fund'
          target_amount: number
          current_amount: number
          start_date: string
          end_date: string | null
          category: string | null
          tracking_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_type: 'savings' | 'expense_limit' | 'income_goal' | 'debt_payoff' | 'investment' | 'emergency_fund'
          target_amount: number
          current_amount?: number
          start_date: string
          end_date?: string | null
          category?: string | null
          tracking_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_type?: 'savings' | 'expense_limit' | 'income_goal' | 'debt_payoff' | 'investment' | 'emergency_fund'
          target_amount?: number
          current_amount?: number
          start_date?: string
          end_date?: string | null
          category?: string | null
          tracking_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      target_progress: {
        Row: {
          id: string
          target_id: string
          progress_date: string
          amount_contributed: number
          cumulative_amount: number
          percentage_complete: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          target_id: string
          progress_date: string
          amount_contributed?: number
          cumulative_amount?: number
          percentage_complete?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          target_id?: string
          progress_date?: string
          amount_contributed?: number
          cumulative_amount?: number
          percentage_complete?: number
          notes?: string | null
          created_at?: string
        }
      }
      target_notifications: {
        Row: {
          id: string
          target_id: string
          notification_type: 'milestone' | 'deadline' | 'off_track' | 'completed'
          trigger_condition: Json
          message_template: string
          is_enabled: boolean
          last_triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          target_id: string
          notification_type: 'milestone' | 'deadline' | 'off_track' | 'completed'
          trigger_condition: Json
          message_template: string
          is_enabled?: boolean
          last_triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          target_id?: string
          notification_type?: 'milestone' | 'deadline' | 'off_track' | 'completed'
          trigger_condition?: Json
          message_template?: string
          is_enabled?: boolean
          last_triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      account_types: {
        Row: {
          id: string
          user_id: string
          name: string
          category: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
          normal_balance: 'debit' | 'credit'
          description: string | null
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
          normal_balance: 'debit' | 'credit'
          description?: string | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
          normal_balance?: 'debit' | 'credit'
          description?: string | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          account_type_id: string
          name: string
          account_number: string | null
          description: string | null
          current_balance: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_type_id: string
          name: string
          account_number?: string | null
          description?: string | null
          current_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_type_id?: string
          name?: string
          account_number?: string | null
          description?: string | null
          current_balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ledger_entries: {
        Row: {
          id: string
          user_id: string
          transaction_id: string | null
          entry_date: string
          reference_number: string | null
          description: string
          total_amount: number
          is_balanced: boolean
          reconciliation_status: 'unreconciled' | 'reconciled' | 'disputed'
          reconciled_at: string | null
          reconciled_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id?: string | null
          entry_date: string
          reference_number?: string | null
          description: string
          total_amount: number
          is_balanced?: boolean
          reconciliation_status?: 'unreconciled' | 'reconciled' | 'disputed'
          reconciled_at?: string | null
          reconciled_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string | null
          entry_date?: string
          reference_number?: string | null
          description?: string
          total_amount?: number
          is_balanced?: boolean
          reconciliation_status?: 'unreconciled' | 'reconciled' | 'disputed'
          reconciled_at?: string | null
          reconciled_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ledger_entry_lines: {
        Row: {
          id: string
          ledger_entry_id: string
          account_id: string
          debit_amount: number
          credit_amount: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ledger_entry_id: string
          account_id: string
          debit_amount?: number
          credit_amount?: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ledger_entry_id?: string
          account_id?: string
          debit_amount?: number
          credit_amount?: number
          description?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          budget_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string
          total_budget: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          budget_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string
          total_budget: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          budget_period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string
          total_budget?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budget_categories: {
        Row: {
          id: string
          budget_id: string
          category_name: string
          allocated_amount: number
          spent_amount: number
          remaining_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          category_name: string
          allocated_amount: number
          spent_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          category_name?: string
          allocated_amount?: number
          spent_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          monthly_income_target: number | null
          emergency_fund_goal: number | null
          saving_amount: number | null
          total_savings: number
          theme: 'light' | 'dark'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          monthly_income_target?: number | null
          emergency_fund_goal?: number | null
          saving_amount?: number | null
          total_savings?: number
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          monthly_income_target?: number | null
          emergency_fund_goal?: number | null
          saving_amount?: number | null
          total_savings?: number
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          timestamp: string
          event_type: string
          user_id: string | null
          session_id: string | null
          action_performed: string
          status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'PARTIAL'
          log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
          error_message: string | null
          warning_message: string | null
          transaction_id: string | null
          source_ip: string | null
          user_agent: string | null
          affected_table: string | null
          affected_record_id: string | null
          before_data: Json | null
          after_data: Json | null
          metadata: Json
          request_id: string | null
          execution_time_ms: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          timestamp?: string
          event_type: string
          user_id?: string | null
          session_id?: string | null
          action_performed: string
          status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'PARTIAL'
          log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
          error_message?: string | null
          warning_message?: string | null
          transaction_id?: string | null
          source_ip?: string | null
          user_agent?: string | null
          affected_table?: string | null
          affected_record_id?: string | null
          before_data?: Json | null
          after_data?: Json | null
          metadata?: Json
          request_id?: string | null
          execution_time_ms?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          timestamp?: string
          event_type?: string
          user_id?: string | null
          session_id?: string | null
          action_performed?: string
          status?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'PARTIAL'
          log_level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
          error_message?: string | null
          warning_message?: string | null
          transaction_id?: string | null
          source_ip?: string | null
          user_agent?: string | null
          affected_table?: string | null
          affected_record_id?: string | null
          before_data?: Json | null
          after_data?: Json | null
          metadata?: Json
          request_id?: string | null
          execution_time_ms?: number | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_event: {
        Args: {
          p_event_type: string
          p_user_id?: string
          p_session_id?: string
          p_action_performed?: string
          p_status?: string
          p_log_level?: string
          p_error_message?: string
          p_warning_message?: string
          p_transaction_id?: string
          p_source_ip?: string
          p_user_agent?: string
          p_affected_table?: string
          p_affected_record_id?: string
          p_before_data?: Json
          p_after_data?: Json
          p_metadata?: Json
          p_request_id?: string
          p_execution_time_ms?: number
        }
        Returns: string
      }
      sanitize_log_data: {
        Args: {
          data: Json
        }
        Returns: Json
      }
      setup_default_account_types: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}