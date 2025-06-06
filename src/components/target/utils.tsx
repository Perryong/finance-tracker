
export const getProgressColor = (progressPercentage: number) => {
  if (progressPercentage >= 100) return 'text-green-600';
  if (progressPercentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const getStatusMessage = (progressPercentage: number) => {
  if (progressPercentage >= 100) return '🎉 Emergency fund goal achieved!';
  if (progressPercentage >= 75) return '💪 Almost there! Keep going!';
  if (progressPercentage >= 50) return '📈 Great progress! Halfway to your goal!';
  if (progressPercentage >= 25) return '🚀 Good start! Keep building your fund!';
  return '💡 Start building your emergency fund today!';
};
