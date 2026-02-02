import { useState, useEffect } from 'react';
import { Bell, ChefHat, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupOrder } from '@/types/menu';

interface OrderNotification {
  id: string;
  orderId: string;
  orderName: string;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
  read: boolean;
}

interface OrderNotificationsProps {
  orders: GroupOrder[];
}

const statusConfig = {
  received: {
    label: 'Order Received',
    icon: Bell,
    color: 'text-warning',
  },
  preparing: {
    label: 'Being Prepared',
    icon: ChefHat,
    color: 'text-primary',
  },
  ready: {
    label: 'Ready for Pickup',
    icon: CheckCircle2,
    color: 'text-success',
  },
  served: {
    label: 'Served',
    icon: UtensilsCrossed,
    color: 'text-muted-foreground',
  },
};

export function OrderNotifications({ orders }: OrderNotificationsProps) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [previousOrderStatuses, setPreviousOrderStatuses] = useState<
    Record<string, string>
  >({});

  // Track order status changes
  useEffect(() => {
    orders.forEach((order) => {
      const prevStatus = previousOrderStatuses[order.id];
      if (prevStatus && prevStatus !== order.status) {
        // Status changed! Add notification
        const newNotification: OrderNotification = {
          id: `${order.id}-${Date.now()}`,
          orderId: order.id,
          orderName: `Order by ${order.submittedBy}`,
          oldStatus: prevStatus,
          newStatus: order.status,
          timestamp: new Date(),
          read: false,
        };
        setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
      }
    });

    // Update tracked statuses
    const newStatuses: Record<string, string> = {};
    orders.forEach((order) => {
      newStatuses[order.id] = order.status;
    });
    setPreviousOrderStatuses(newStatuses);
  }, [orders]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      markAllAsRead();
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  if (orders.length === 0) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 flex items-center justify-center text-xs p-0 px-1.5"
                >
                  {unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Order Updates</h3>
          <p className="text-xs text-muted-foreground">
            Get notified when your order status changes
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll notify you when your order is updated
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const config =
                  statusConfig[
                    notification.newStatus as keyof typeof statusConfig
                  ];
                const StatusIcon = config?.icon || Bell;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 flex gap-3 ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${config?.color}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {config?.label || 'Status Updated'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.orderName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        {/* Current Orders Summary */}
        {orders.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Current Orders
            </p>
            <div className="space-y-2">
              {orders.slice(0, 3).map((order) => {
                const config =
                  statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = config?.icon || Bell;

                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <StatusIcon className={`w-3 h-3 ${config?.color}`} />
                    <span className="text-foreground truncate flex-1">
                      {order.submittedBy}'s order
                    </span>
                    <span className={`font-medium ${config?.color}`}>
                      {config?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
