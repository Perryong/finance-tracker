import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  type: 'income' | 'expense';
  isRecurring?: boolean;
  dueDate?: string;
  isUnusual?: boolean;
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleTheme: () => void;
  setMonthlyIncomeTarget: (amount: number | null) => void;
  setEmergencyFundGoal: (amount: number | null) => void;
  setSavingAmount: (amount: number | null) => void;
}

const defaultCategories: Category[] = [
  // Income Categories
  { id: '1', name: 'Salary', color: '#10b981', type: 'income' },
  { id: '2', name: 'Investments', color: '#06b6d4', type: 'income' },
  { id: '3', name: 'Freelance', color: '#8b5cf6', type: 'income' },
  { id: '4', name: 'Bonus', color: '#f59e0b', type: 'income' },
  { id: '5', name: 'Other Income', color: '#64748b', type: 'income' },
  
  // Expense Categories
  { id: '6', name: 'Housing', color: '#ef4444', type: 'expense' },
  { id: '7', name: 'Utilities', color: '#f97316', type: 'expense' },
  { id: '8', name: 'Groceries', color: '#22c55e', type: 'expense' },
  { id: '9', name: 'Transportation', color: '#3b82f6', type: 'expense' },
  { id: '10', name: 'Entertainment', color: '#ec4899', type: 'expense' },
  { id: '11', name: 'Healthcare', color: '#8b5cf6', type: 'expense' },
  { id: '12', name: 'Insurance', color: '#64748b', type: 'expense' },
  { id: '13', name: 'Savings', color: '#0ea5e9', type: 'expense' },
  { id: '14', name: 'Investments', color: '#6366f1', type: 'expense' },
  { id: '15', name: 'Dining Out', color: '#f43f5e', type: 'expense' },
  { id: '16', name: 'Shopping', color: '#a855f7', type: 'expense' },
  { id: '17', name: 'Education', color: '#0d9488', type: 'expense' },
  { id: '18', name: 'Debt Payment', color: '#dc2626', type: 'expense' },
  { id: '19', name: 'Other Expenses', color: '#71717a', type: 'expense' }
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
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Date.now().toString() },
          ],
        })),
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
    }),
    {
      name: 'finance-tracker-storage',
    }
  )
);