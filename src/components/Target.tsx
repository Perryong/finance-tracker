
import React from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from 'date-fns';
import { ProgressOverview } from '@/components/target/ProgressOverview';
import { EmergencyFundDetailsTable } from '@/components/target/EmergencyFundDetailsTable';
import { RecommendationsCard } from '@/components/target/RecommendationsCard';
import { getProgressColor, getStatusMessage } from '@/components/target/utils';

export const Target = () => {
  const { 
    transactions, 
    monthlyIncomeTarget, 
    emergencyFundGoal,
    savingAmount,
    setMonthlyIncomeTarget,
    setEmergencyFundGoal,
    setSavingAmount
  } = useFinanceStore();

  // Calculate monthly savings from dashboard logic
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
  const dashboardMonthlySavings = savingAmount ?? netBalance;

  // Calculate current balance by adding dashboard monthly savings to any existing savings
  const baseBalance = savingAmount ? 0 : transactions.reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = baseBalance + dashboardMonthlySavings;
  
  // Use user-defined values only - no auto-calculation
  const monthlyIncome = monthlyIncomeTarget ?? 0;
  const finalEmergencyFundGoal = emergencyFundGoal ?? 0;
  
  console.log('Emergency fund goal:', finalEmergencyFundGoal);
  
  // Calculate progress
  const amountNeeded = Math.max(0, finalEmergencyFundGoal - currentBalance);
  const progressPercentage = finalEmergencyFundGoal > 0 ? Math.min(100, (currentBalance / finalEmergencyFundGoal) * 100) : 0;
  
  // Calculate estimated time to goal: Emergency fund goal / current saving balance
  const monthsToGoal = currentBalance > 0 ? Math.ceil(finalEmergencyFundGoal / currentBalance) : 0;

  const handleMonthlyIncomeChange = (value: number) => {
    setMonthlyIncomeTarget(value);
  };

  const handleEmergencyFundGoalChange = (value: number) => {
    setEmergencyFundGoal(value);
  };

  const handleSavingAmountChange = (value: number) => {
    // Update the base savings amount, current balance will recalculate automatically
    setSavingAmount(value - dashboardMonthlySavings);
  };

  const resetSavingAmountToAuto = () => {
    setSavingAmount(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Emergency Fund Target</h1>
      </div>

      <ProgressOverview
        progressPercentage={progressPercentage}
        getProgressColor={() => getProgressColor(progressPercentage)}
        getStatusMessage={() => getStatusMessage(progressPercentage)}
      />

      <EmergencyFundDetailsTable
        monthlyIncome={monthlyIncome}
        finalEmergencyFundGoal={finalEmergencyFundGoal}
        currentBalance={currentBalance}
        amountNeeded={amountNeeded}
        monthsToGoal={monthsToGoal}
        monthlyIncomeTarget={monthlyIncomeTarget}
        emergencyFundGoal={emergencyFundGoal}
        savingAmount={currentBalance}
        handleMonthlyIncomeChange={handleMonthlyIncomeChange}
        handleEmergencyFundGoalChange={handleEmergencyFundGoalChange}
        handleSavingAmountChange={handleSavingAmountChange}
        resetSavingAmountToAuto={resetSavingAmountToAuto}
      />

      <RecommendationsCard
        progressPercentage={progressPercentage}
        monthsToGoal={monthsToGoal}
      />
    </div>
  );
};
