import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/store/financeStore';
import { DoughnutChart } from './DoughnutChart';
import { LineChart } from './LineChart';
import { TransactionModal } from './TransactionModal';
import { InlineEdit } from './InlineEdit';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';

export const Dashboard = () => {
  const { transactions, categories, savingAmount, setSavingAmount, totalSavings, setTotalSavings } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const currentMonthTransactions = transactions.filter((transaction) =>
    isWithinInterval(new Date(transaction.date), { start: monthStart, end: monthEnd })
  );
  
  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const netBalance = totalIncome - totalExpenses;
  
  // Calculate monthly savings - use saving amount if set, otherwise use monthly net balance
  const displaySavingAmount = savingAmount ?? netBalance;
  
  // Group expenses by category for doughnut chart
  const expensesByCategory = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = categories.find((c) => c.name === transaction.category);
      const categoryName = category?.name || 'Other';
      acc[categoryName] = (acc[categoryName] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

  const handleSavingAmountChange = (value: number) => {
    setSavingAmount(value);
  };

  const handleTotalSavingsChange = (value: number) => {
    setTotalSavings(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">{format(currentMonth, 'MMMM yyyy')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${netBalance >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Net Balance</CardTitle>
            <DollarSign className={`h-4 w-4 ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              ${netBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <InlineEdit
                value={displaySavingAmount}
                onSave={handleSavingAmountChange}
              />
              <p className="text-xs text-gray-500">
                {savingAmount !== null ? 'User-set monthly target' : 'Auto-calculated from monthly net balance'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <InlineEdit
                value={totalSavings}
                onSave={handleTotalSavingsChange}
              />
              <p className="text-xs text-gray-500">
                Total accumulated savings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={expensesByCategory} categories={categories} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart transactions={currentMonthTransactions} />
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};