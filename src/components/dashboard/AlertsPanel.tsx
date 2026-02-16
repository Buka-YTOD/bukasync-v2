import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Receipt, HelpCircle, Check, X, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Alert {
  id: string;
  table_number: number;
  type: 'waiter' | 'bill' | 'assistance';
  status: 'pending' | 'assigned' | 'completed';
  guest_name: string | null;
  created_at: string;
}

const alertConfig = {
  waiter: { label: 'Call Waiter', icon: Bell, color: 'bg-primary/10 text-primary' },
  bill: { label: 'Request Bill', icon: Receipt, color: 'bg-warning/10 text-warning' },
  assistance: { label: 'Need Help', icon: HelpCircle, color: 'bg-accent/10 text-accent' },
};

const formatTimeAgo = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
};

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('service_alerts')
      .select('*')
      .in('status', ['pending', 'assigned'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
    } else {
      setAlerts((data || []) as Alert[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    const channel = supabase
      .channel('alerts-panel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_alerts' }, () => fetchAlerts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (alertId: string, status: 'assigned' | 'completed') => {
    const update: Record<string, unknown> = { status };
    if (status === 'completed') update.resolved_at = new Date().toISOString();

    const { error } = await supabase.from('service_alerts').update(update).eq('id', alertId);
    if (error) {
      toast.error('Failed to update alert');
    } else {
      setAlerts(prev => status === 'completed' ? prev.filter(a => a.id !== alertId) : prev.map(a => a.id === alertId ? { ...a, status } : a));
    }
  };

  const dismissAlert = async (alertId: string) => {
    const { error } = await supabase.from('service_alerts').delete().eq('id', alertId);
    if (error) toast.error('Failed to dismiss alert');
    else setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const activeAlerts = alerts.filter(a => a.status === 'assigned');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Service Alerts</h2>
        <p className="text-muted-foreground">{pendingAlerts.length} pending • {activeAlerts.length} in progress</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending */}
        <div>
          <h3 className="font-medium text-foreground mb-4">Pending Requests</h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pendingAlerts.map(alert => {
                const config = alertConfig[alert.type];
                const Icon = config.icon;
                return (
                  <motion.div key={alert.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-xl border border-border p-4 shadow-soft">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Table {alert.table_number}</p>
                          <p className="text-sm text-muted-foreground">{config.label} • {alert.guest_name || 'Guest'} • {formatTimeAgo(alert.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => updateStatus(alert.id, 'assigned')}>
                          <User className="w-4 h-4 mr-1" />Assign
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {pendingAlerts.length === 0 && <div className="text-center py-8 text-muted-foreground">No pending requests</div>}
            </AnimatePresence>
          </div>
        </div>

        {/* Active */}
        <div>
          <h3 className="font-medium text-foreground mb-4">In Progress</h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeAlerts.map(alert => {
                const config = alertConfig[alert.type];
                const Icon = config.icon;
                return (
                  <motion.div key={alert.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-card rounded-xl border border-border p-4 shadow-soft">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Table {alert.table_number}</p>
                          <p className="text-sm text-muted-foreground">{config.label} • {alert.guest_name || 'Guest'} • {formatTimeAgo(alert.created_at)}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="success" onClick={() => updateStatus(alert.id, 'completed')}>
                        <Check className="w-4 h-4 mr-1" />Complete
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
              {activeAlerts.length === 0 && <div className="text-center py-8 text-muted-foreground">No active requests</div>}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
