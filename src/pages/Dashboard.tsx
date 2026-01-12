import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OrdersPanel } from '@/components/dashboard/OrdersPanel';
import { MenuManagement } from '@/components/dashboard/MenuManagement';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { TablesPanel } from '@/components/dashboard/TablesPanel';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('orders');

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <OrdersPanel />;
      case 'tables':
        return <TablesPanel />;
      case 'menu':
        return <MenuManagement />;
      case 'alerts':
        return <AlertsPanel />;
      default:
        return <OrdersPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
