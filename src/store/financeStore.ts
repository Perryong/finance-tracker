import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  type: 'income' | 'expense';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  theme: 'light' | 'dark';
  monthlyIncomeTarget: number | null;
  emergencyFundGoal: number | null;
  savingAmount: number | null;
  totalSavings: number;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleTheme: () => void;
  setMonthlyIncomeTarget: (amount: number | null) => void;
  setEmergencyFundGoal: (amount: number | null) => void;
  setSavingAmount: (amount: number | null) => void;
  setTotalSavings: (amount: number) => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Food', color: '#ef4444', type: 'expense' },
  { id: '2', name: 'Transport', color: '#f97316', type: 'expense' },
  { id: '3', name: 'Entertainment', color: '#eab308', type: 'expense' },
  { id: '4', name: 'Shopping', color: '#22c55e', type: 'expense' },
  { id: '5', name: 'Bills', color: '#3b82f6', type: 'expense' },
  { id: '6', name: 'Healthcare', color: '#8b5cf6', type: 'expense' },
  { id: '7', name: 'Salary', color: '#10b981', type: 'income' },
  { id: '8', name: 'Freelance', color: '#06b6d4', type: 'income' },
  { id: '9', name: 'Investment', color: '#8b5cf6', type: 'income' },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,
      theme: 'light',
      monthlyIncomeTarget: null,
      emergencyFundGoal: null,
      savingAmount: null,
      totalSavings: 0,
      addTransaction: async (transaction) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('transactions')
          .insert({
            ...transaction,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        
        set((state) => ({
          transactions: [...state.transactions, data],
        }));
      },
      updateTransaction: async (id, updates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      deleteTransaction: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      addCategory: async (category) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('categories')
          .insert({
            ...category,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          categories: [...state.categories, data],
        }));
      },
      updateCategory: async (id, updates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from('categories')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },
      deleteCategory: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setMonthlyIncomeTarget: (amount) =>
        set(() => ({
          monthlyIncomeTarget: amount,
        })),
      setEmergencyFundGoal: (amount) =>
        set(() => ({
          emergencyFundGoal: amount,
        })),
      setSavingAmount: (amount) =>
        set(() => ({
          savingAmount: amount,
        })),
      setTotalSavings: (amount) =>
        set(() => ({
          totalSavings: amount,
        })),
    }),
    {
      name: 'finance-tracker-storage',
    }
  )
);