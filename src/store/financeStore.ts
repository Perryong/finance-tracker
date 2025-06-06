import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createTransactionWithDebug } from '@/lib/supabaseDebug';

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
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
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
        try {
          console.log('🔄 Adding transaction via store:', transaction);
          
          // Use the debug-enabled transaction creation
          const savedTransaction = await createTransactionWithDebug(transaction);
          
          // Add to local state with the returned ID
          set((state) => ({
            transactions: [
              ...state.transactions,
              {
                ...transaction,
                id: savedTransaction.id,
                amount: savedTransaction.amount
              },
            ],
          }));
          
          console.log('✅ Transaction added to store successfully');
          
        } catch (error) {
          console.error('❌ Failed to add transaction:', error);
          // Don't add to local state if Supabase insertion failed
          throw error;
        }
      },
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      addCategory: (category) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: Date.now().toString() },
          ],
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
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