import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Receipt, HelpCircle, Check, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Alert {
  id: string;
  tableNumber: number;
  type: 'waiter' | 'bill' | 'assistance';
  status: 'pending' | 'assigned' | 'completed';
  createdAt: string;
}

const demoAlerts: Alert[] = [
  {
    id: 'ALT-001',
    tableNumber: 7,
    type: 'waiter',
    status: 'pending',
    createdAt: '1 min ago',
  },
  {
    id: 'ALT-002',
    tableNumber: 3,
    type: 'bill',
    status: 'pending',
    createdAt: '3 mins ago',
  },
  {
    id: 'ALT-003',
    tableNumber: 12,
    type: 'assistance',
    status: 'assigned',
    createdAt: '5 mins ago',
  },
];

const alertConfig = {
  waiter: {
    label: 'Call Waiter',
    icon: Bell,
    color: 'bg-primary/10 text-primary',
  },
  bill: {
    label: 'Request Bill',
    icon: Receipt,
    color: 'bg-warning/10 text-warning',
  },
  assistance: {
    label: 'Need Help',
    icon: HelpCircle,
    color: 'bg-accent/10 text-accent',
  },
};

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);

  const updateAlertStatus = (alertId: string, status: Alert['status']) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const pendingAlerts = alerts.filter((a) => a.status === 'pending');
  const activeAlerts = alerts.filter((a) => a.status === 'assigned');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Service Alerts
        </h2>
        <p className="text-muted-foreground">
          {pendingAlerts.length} pending • {activeAlerts.length} in progress
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Alerts */}
        <div>
          <h3 className="font-medium text-foreground mb-4">Pending Requests</h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingAlerts.map((alert) => {
                const config = alertConfig[alert.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-card rounded-xl border border-border p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Table {alert.tableNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {config.label} • {alert.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateAlertStatus(alert.id, 'assigned')}
                        >
                          <User className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {pendingAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Active Alerts */}
        <div>
          <h3 className="font-medium text-foreground mb-4">In Progress</h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeAlerts.map((alert) => {
                const config = alertConfig[alert.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-card rounded-xl border border-border p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Table {alert.tableNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {config.label} • {alert.createdAt}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
              {activeAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No active requests
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
