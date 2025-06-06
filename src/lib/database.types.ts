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
    }
  }
}