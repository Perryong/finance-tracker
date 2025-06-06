
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressOverviewProps {
  progressPercentage: number;
  getProgressColor: () => string;
  getStatusMessage: () => string;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  progressPercentage,
  getProgressColor,
  getStatusMessage
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Emergency Fund Progress</span>
          <span className={`text-2xl font-bold ${getProgressColor()}`}>
            {progressPercentage.toFixed(1)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercentage} className="h-4" />
        <p className="text-center text-lg font-medium text-gray-700">
          {getStatusMessage()}
        </p>
      </CardContent>
    </Card>
  );
};
