
import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { Transactions } from '@/components/Transactions';
import { Target } from '@/components/Target';
import { MonthlyLedger } from '@/components/MonthlyLedger';
import { Settings } from '@/components/Settings';
import { useFinanceStore } from '@/store/financeStore';

const Index = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { theme } = useFinanceStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'target':
        return <Target />;
      case 'ledger':
        return <MonthlyLedger />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${theme === 'dark' ? 'dark' : ''}`}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
