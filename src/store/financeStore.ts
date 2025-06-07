import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

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
  loadTransactions: () => Promise<void>;
  loadCategories: () => Promise<void>;
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
      
      loadTransactions: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) {
            console.error('Error loading transactions:', error);
            return;
          }

          set({ transactions: data || [] });
        } catch (error) {
          console.error('Failed to load transactions:', error);
        }
      },

      loadCategories: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.error('Error loading categories:', error);
            return;
          }

          if (data && data.length > 0) {
            set({ categories: data });
          }
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
      },

      addTransaction: async (transaction) => {
        try {
          console.log('Adding transaction:', transaction);
          
          // Get authenticated user
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('Auth error:', authError);
            toast({
              title: "Authentication Error",
              description: "Please sign in to add transactions.",
              variant: "destructive",
            });
            return;
          }

          if (!user) {
            console.error('No authenticated user');
            toast({
              title: "Authentication Required",
              description: "Please sign in to add transactions.",
              variant: "destructive",
            });
            return;
          }

          // Prepare transaction data
          const transactionData = {
            user_id: user.id,
            amount: parseFloat(transaction.amount.toString()),
            category: transaction.category,
            date: transaction.date,
            notes: transaction.notes || null,
            type: transaction.type,
            status: 'completed' as const,
          };

          console.log('Inserting transaction data:', transactionData);

          // Insert into Supabase
          const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

          if (error) {
            console.error('Supabase error:', error);
            toast({
              title: "Database Error",
              description: `Failed to save transaction: ${error.message}`,
              variant: "destructive",
            });
            return;
          }

          if (!data) {
            console.error('No data returned from insert');
            toast({
              title: "Error",
              description: "No data returned from database.",
              variant: "destructive",
            });
            return;
          }

          console.log('Transaction saved successfully:', data);

          // Add to local state
          set((state) => ({
            transactions: [data, ...state.transactions],
          }));

          toast({
            title: "Success",
            description: "Transaction added successfully!",
          });

        } catch (error) {
          console.error('Failed to add transaction:', error);
          toast({
            title: "Error",
            description: "Failed to add transaction. Please try again.",
            variant: "destructive",
          });
        }
      },

      updateTransaction: async (id, updates) => {
        try {
          const { error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id);

          if (error) {
            console.error('Error updating transaction:', error);
            toast({
              title: "Error",
              description: "Failed to update transaction.",
              variant: "destructive",
            });
            return;
          }

          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          }));

          toast({
            title: "Success",
            description: "Transaction updated successfully!",
          });
        } catch (error) {
          console.error('Failed to update transaction:', error);
        }
      },

      deleteTransaction: async (id) => {
        try {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting transaction:', error);
            toast({
              title: "Error",
              description: "Failed to delete transaction.",
              variant: "destructive",
            });
            return;
          }

          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }));

          toast({
            title: "Success",
            description: "Transaction deleted successfully!",
          });
        } catch (error) {
          console.error('Failed to delete transaction:', error);
        }
      },

      addCategory: async (category) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const categoryData = {
            user_id: user.id,
            name: category.name,
            color: category.color,
            type: category.type,
          };

          const { data, error } = await supabase
            .from('categories')
            .insert(categoryData)
            .select()
            .single();

          if (error) {
            console.error('Error adding category:', error);
            toast({
              title: "Error",
              description: "Failed to add category.",
              variant: "destructive",
            });
            return;
          }

          set((state) => ({
            categories: [...state.categories, data],
          }));

          toast({
            title: "Success",
            description: "Category added successfully!",
          });
        } catch (error) {
          console.error('Failed to add category:', error);
        }
      },

      updateCategory: async (id, updates) => {
        try {
          const { error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id);

          if (error) {
            console.error('Error updating category:', error);
            return;
          }

          set((state) => ({
            categories: state.categories.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }));
        } catch (error) {
          console.error('Failed to update category:', error);
        }
      },

      deleteCategory: async (id) => {
        try {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting category:', error);
            return;
          }

          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete category:', error);
        }
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