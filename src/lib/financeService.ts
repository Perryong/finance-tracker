import { supabase } from './supabase';
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];

// Helper types for better type safety
export type Profile = Tables['profiles']['Row'];
export type Transaction = Tables['transactions']['Row'];
export type Category = Tables['categories']['Row'];
export type PaymentMethod = Tables['payment_methods']['Row'];
export type FinancialTarget = Tables['financial_targets']['Row'];
export type TargetProgress = Tables['target_progress']['Row'];
export type Account = Tables['accounts']['Row'];
export type AccountType = Tables['account_types']['Row'];
export type LedgerEntry = Tables['ledger_entries']['Row'];
export type LedgerEntryLine = Tables['ledger_entry_lines']['Row'];
export type Budget = Tables['budgets']['Row'];
export type BudgetCategory = Tables['budget_categories']['Row'];
export type DashboardMetric = Tables['dashboard_metrics']['Row'];
export type UserSettings = Tables['user_settings']['Row'];

/**
 * Service class for managing financial data operations
 */
export class FinanceService {
  
  // =============================================
  // USER PROFILE OPERATIONS
  // =============================================
  
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // =============================================
  // TRANSACTION OPERATIONS
  // =============================================
  
  static async getTransactions(userId: string, options?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: 'income' | 'expense';
    limit?: number;
  }): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        payment_methods(name, type),
        transaction_attachments(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }
    
    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }
    
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }
  
  static async createTransaction(transaction: Tables['transactions']['Insert']): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async updateTransaction(id: string, updates: Tables['transactions']['Update']): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // =============================================
  // PAYMENT METHOD OPERATIONS
  // =============================================
  
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  static async createPaymentMethod(paymentMethod: Tables['payment_methods']['Insert']): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentMethod)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // =============================================
  // FINANCIAL TARGET OPERATIONS
  // =============================================
  
  static async getFinancialTargets(userId: string): Promise<FinancialTarget[]> {
    const { data, error } = await supabase
      .from('financial_targets')
      .select(`
        *,
        target_progress(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
  
  static async createFinancialTarget(target: Tables['financial_targets']['Insert']): Promise<FinancialTarget> {
    const { data, error } = await supabase
      .from('financial_targets')
      .insert(target)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async updateTargetProgress(
    targetId: string, 
    progress: Tables['target_progress']['Insert']
  ): Promise<TargetProgress> {
    const { data, error } = await supabase
      .from('target_progress')
      .insert(progress)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // =============================================
  // BUDGET OPERATIONS
  // =============================================
  
  static async getBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        budget_categories(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  static async createBudget(budget: Tables['budgets']['Insert']): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // =============================================
  // LEDGER OPERATIONS
  // =============================================
  
  static async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_types(name, category, normal_balance)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
  
  static async createLedgerEntry(
    entry: Tables['ledger_entries']['Insert'],
    lines: Tables['ledger_entry_lines']['Insert'][]
  ): Promise<LedgerEntry> {
    const { data: entryData, error: entryError } = await supabase
      .from('ledger_entries')
      .insert(entry)
      .select()
      .single();
    
    if (entryError) throw entryError;
    
    // Add ledger entry ID to all lines
    const linesWithEntryId = lines.map(line => ({
      ...line,
      ledger_entry_id: entryData.id
    }));
    
    const { error: linesError } = await supabase
      .from('ledger_entry_lines')
      .insert(linesWithEntryId);
    
    if (linesError) throw linesError;
    
    return entryData;
  }
  
  // =============================================
  // DASHBOARD METRICS
  // =============================================
  
  static async getDashboardMetrics(userId: string, date: string): Promise<DashboardMetric | null> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  
  static async getMonthlyOverview(userId: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const [transactions, metrics] = await Promise.all([
      this.getTransactions(userId, { startDate, endDate }),
      supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('metric_date', startDate)
        .lte('metric_date', endDate)
        .order('metric_date')
    ]);
    
    return {
      transactions,
      metrics: metrics.data || [],
      summary: {
        totalIncome: transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        transactionCount: transactions.length,
        topCategories: this.getTopCategories(transactions)
      }
    };
  }
  
  // =============================================
  // UTILITY METHODS
  // =============================================
  
  private static getTopCategories(transactions: Transaction[]): Array<{category: string, amount: number, count: number}> {
    const categoryMap = new Map<string, {amount: number, count: number}>();
    
    transactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
      categoryMap.set(transaction.category, {
        amount: existing.amount + Math.abs(transaction.amount),
        count: existing.count + 1
      });
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }
  
  // =============================================
  // VALIDATION METHODS
  // =============================================
  
  static validateTransaction(transaction: Partial<Transaction>): string[] {
    const errors: string[] = [];
    
    if (!transaction.amount || transaction.amount === 0) {
      errors.push('Amount is required and must be non-zero');
    }
    
    if (!transaction.category?.trim()) {
      errors.push('Category is required');
    }
    
    if (!transaction.date) {
      errors.push('Date is required');
    }
    
    if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
      errors.push('Type must be either income or expense');
    }
    
    return errors;
  }
  
  static validateLedgerEntry(
    entry: Partial<LedgerEntry>, 
    lines: Partial<LedgerEntryLine>[]
  ): string[] {
    const errors: string[] = [];
    
    if (!entry.description?.trim()) {
      errors.push('Description is required');
    }
    
    if (!entry.entry_date) {
      errors.push('Entry date is required');
    }
    
    if (!lines || lines.length < 2) {
      errors.push('At least two ledger lines are required for double-entry');
    }
    
    // Validate that debits equal credits
    const totalDebits = lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      errors.push('Total debits must equal total credits');
    }
    
    return errors;
  }
}

// Export commonly used types
export type {
  Profile,
  Transaction,
  Category,
  PaymentMethod,
  FinancialTarget,
  TargetProgress,
  Account,
  AccountType,
  LedgerEntry,
  LedgerEntryLine,
  Budget,
  BudgetCategory,
  DashboardMetric,
  UserSettings
};