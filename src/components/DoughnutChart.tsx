
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Category } from '@/store/financeStore';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: Record<string, number>;
  categories: Category[];
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, categories }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  const colors = labels.map(label => {
    const category = categories.find(c => c.name === label);
    return category?.color || '#6b7280';
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(color => color),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (values.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No expense data for this month
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};
