
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationsCardProps {
  progressPercentage: number;
  monthsToGoal: number;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  progressPercentage,
  monthsToGoal
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {progressPercentage < 100 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Tips to Reach Your Goal:</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Review your expenses to identify areas where you can cut back</li>
                <li>Consider automating transfers to your emergency fund</li>
                <li>Look for ways to increase your income through side projects or skills development</li>
                {monthsToGoal > 0 && (
                  <li>Based on your current balance, it will take approximately {monthsToGoal} months to reach your goal</li>
                )}
              </ul>
            </div>
          )}
          {progressPercentage >= 100 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h4>
              <p className="text-green-700">
                You've successfully built your emergency fund! Consider investing any excess funds or 
                setting new financial goals like retirement savings or a major purchase.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
