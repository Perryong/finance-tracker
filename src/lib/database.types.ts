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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
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
          created_at?: string
          updated_at?: string
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
          created_at: string
        }
        Insert: {
          id?: string
          timestamp?: string
          event_type: string
          user_id?: string | null
          session_id?: string | null
          action_performed: string
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
          created_at?: string
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
          created_at?: string
        }
      }
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
    }
  }
}