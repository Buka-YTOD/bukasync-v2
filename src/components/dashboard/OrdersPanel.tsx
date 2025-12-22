import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  tableNumber: number;
  items: { name: string; quantity: number; price: number }[];
  status: 'received' | 'preparing' | 'ready';
  createdAt: string;
  totalAmount: number;
}

const demoOrders: Order[] = [
  {
    id: 'ORD-001',
    tableNumber: 7,
    items: [
      { name: 'Jollof Rice Supreme', quantity: 2, price: 4500 },
      { name: 'Suya Platter', quantity: 1, price: 3500 },
    ],
    status: 'received',
    createdAt: '2 mins ago',
    totalAmount: 12500,
  },
  {
    id: 'ORD-002',
    tableNumber: 3,
    items: [
      { name: 'Egusi Delight', quantity: 1, price: 5500 },
      { name: 'Dodo Platter', quantity: 2, price: 1500 },
    ],
    status: 'preparing',
    createdAt: '8 mins ago',
    totalAmount: 8500,
  },
  {
    id: 'ORD-003',
    tableNumber: 12,
    items: [
      { name: 'Chapman Classic', quantity: 4, price: 1800 },
    ],
    status: 'ready',
    createdAt: '15 mins ago',
    totalAmount: 7200,
  },
];

const statusConfig = {
  received: {
    label: 'Received',
    color: 'bg-warning/10 text-warning border-warning/30',
    icon: Clock,
    nextStatus: 'preparing' as const,
    nextLabel: 'Start Preparing',
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-primary/10 text-primary border-primary/30',
    icon: ChefHat,
    nextStatus: 'ready' as const,
    nextLabel: 'Mark Ready',
  },
  ready: {
    label: 'Ready',
    color: 'bg-success/10 text-success border-success/30',
    icon: CheckCircle2,
    nextStatus: null,
    nextLabel: 'Served',
  },
};

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>(demoOrders);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Live Orders
          </h2>
          <p className="text-muted-foreground">
            {orders.length} active orders
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-xl border border-border p-5 shadow-soft"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold text-foreground">
                        Table {order.tableNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={config.color}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.id} • {order.createdAt}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-foreground">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="text-muted-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="font-semibold text-foreground">
                    Total: {formatPrice(order.totalAmount)}
                  </div>
                  {config.nextStatus && (
                    <Button
                      size="sm"
                      variant={order.status === 'received' ? 'default' : 'success'}
                      onClick={() =>
                        updateOrderStatus(order.id, config.nextStatus!)
                      }
                    >
                      {config.nextLabel}
                    </Button>
                  )}
                  {!config.nextStatus && (
                    <Button size="sm" variant="soft">
                      <UtensilsCrossed className="w-4 h-4 mr-1" />
                      Served
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
