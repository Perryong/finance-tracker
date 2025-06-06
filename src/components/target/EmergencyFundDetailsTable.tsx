import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InlineEdit } from '@/components/InlineEdit';

interface EmergencyFundDetailsTableProps {
  monthlyIncome: number;
  finalEmergencyFundGoal: number;
  currentBalance: number;
  amountNeeded: number;
  monthsToGoal: number;
  monthlyIncomeTarget: number | null;
  emergencyFundGoal: number | null;
  savingAmount: number | null;
  handleMonthlyIncomeChange: (value: number) => void;
  handleEmergencyFundGoalChange: (value: number) => void;
  handleSavingAmountChange: (value: number) => void;
}

export const EmergencyFundDetailsTable: React.FC<EmergencyFundDetailsTableProps> = ({
  monthlyIncome,
  finalEmergencyFundGoal,
  currentBalance,
  amountNeeded,
  monthsToGoal,
  savingAmount,
  handleMonthlyIncomeChange,
  handleEmergencyFundGoalChange,
  handleSavingAmountChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Fund Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Monthly Income</TableCell>
              <TableCell className="text-right">
                <InlineEdit
                  value={monthlyIncome}
                  onSave={handleMonthlyIncomeChange}
                  showResetButton={false}
                />
              </TableCell>
              <TableCell className="text-right">
                <span className="text-blue-600">User Input</span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Emergency Fund Goal</TableCell>
              <TableCell className="text-right">
                <InlineEdit
                  value={finalEmergencyFundGoal}
                  onSave={handleEmergencyFundGoalChange}
                  showResetButton={false}
                />
              </TableCell>
              <TableCell className="text-right">
                <span className="text-purple-600">User Input</span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Current Savings Balance</TableCell>
              <TableCell className="text-right">
                <InlineEdit
                  value={currentBalance}
                  onSave={handleSavingAmountChange}
                />
              </TableCell>
              <TableCell className="text-right">
                <span className={savingAmount !== null ? 'text-green-600' : 'text-gray-600'}>
                  Total accumulated savings
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Amount Still Needed</TableCell>
              <TableCell className="text-right">${amountNeeded.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <span className={amountNeeded === 0 ? 'text-green-600' : 'text-orange-600'}>
                  {amountNeeded === 0 ? 'Goal reached!' : 'In progress'}
                </span>
              </TableCell>
            </TableRow>
            {finalEmergencyFundGoal > 0 && currentBalance > 0 && (
              <TableRow>
                <TableCell className="font-medium">Estimated Time to Goal</TableCell>
                <TableCell className="text-right">
                  {monthsToGoal} month{monthsToGoal !== 1 ? 's' : ''}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-blue-600">Projection</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};