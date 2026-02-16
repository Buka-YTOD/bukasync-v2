import { useState, useEffect } from 'react';
import { Bell, Clock, ChefHat, CheckCircle2, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'order' | 'alert' | 'member';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchRecentActivity = async () => {
    try {
      const [ordersRes, alertsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, submitted_by_name, created_at, dining_sessions(table_number)')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('service_alerts')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const items: Notification[] = [];

      (ordersRes.data || []).forEach((o: any) => {
        items.push({
          id: o.id,
          type: 'order',
          title: `Order from Table ${o.dining_sessions?.table_number || '?'}`,
          description: `${o.submitted_by_name} • ${o.status}`,
          time: formatTimeAgo(new Date(o.created_at)),
          read: o.status !== 'received',
        });
      });

      (alertsRes.data || []).forEach((a: any) => {
        const labels: Record<string, string> = { waiter: 'Call Waiter', bill: 'Request Bill', assistance: 'Need Help' };
        items.push({
          id: a.id,
          type: 'alert',
          title: `${labels[a.type] || a.type} - Table ${a.table_number}`,
          description: a.guest_name || 'Guest',
          time: formatTimeAgo(new Date(a.created_at)),
          read: false,
        });
      });

      items.sort((a, b) => 0); // keep order from DB
      setNotifications(items);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  useEffect(() => {
    fetchRecentActivity();

    const channel = supabase
      .channel('notifications-dropdown')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchRecentActivity())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_alerts' }, () => fetchRecentActivity())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ChefHat className="w-4 h-4 text-primary" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'member': return <Users className="w-4 h-4 text-success" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-popover" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 ${!n.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
