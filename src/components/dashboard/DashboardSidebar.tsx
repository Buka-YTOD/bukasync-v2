import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  UtensilsCrossed, 
  Bell, 
  Settings,
  ChefHat,
  QrCode
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'orders', label: 'Live Orders', icon: ClipboardList },
  { id: 'tables', label: 'Tables & QR', icon: QrCode },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground">
            BukaSync
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.id === 'alerts' && (
                <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                  !
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
