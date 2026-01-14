import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ChefHat, CheckCircle2, UtensilsCrossed, RefreshCw, Users, 
  LayoutGrid, TableIcon, Trash2, Volume2, VolumeX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { playNewOrderSound, playNewUserSound } from '@/lib/notificationSounds';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Order {
  id: string;
  tableNumber: number;
  items: { name: string; quantity: number; price: number }[];
  status: 'received' | 'preparing' | 'ready' | 'served';
  createdAt: string;
  totalAmount: number;
  submittedBy: string;
  sessionId: string;
}

interface DbOrder {
  id: string;
  session_id: string;
  submitted_by_name: string;
  status: string;
  total_amount: number;
  items: unknown;
  created_at: string;
  dining_sessions: {
    table_number: number;
  } | null;
}

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
    nextStatus: 'served' as const,
    nextLabel: 'Mark Served',
  },
  served: {
    label: 'Served',
    color: 'bg-muted text-muted-foreground border-muted',
    icon: UtensilsCrossed,
    nextStatus: null,
    nextLabel: null,
  },
};

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  const previousOrderCount = useRef(0);
  const previousMemberCounts = useRef<Record<string, number>>({});
  const isInitialLoad = useRef(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, dining_sessions(table_number)')
        .in('status', ['received', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedOrders: Order[] = (data || []).map((o: DbOrder) => {
        const items = (o.items as CartItem[]) || [];
        return {
          id: o.id,
          sessionId: o.session_id,
          tableNumber: o.dining_sessions?.table_number || 0,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          status: o.status as Order['status'],
          createdAt: formatTimeAgo(new Date(o.created_at)),
          totalAmount: o.total_amount,
          submittedBy: o.submitted_by_name,
        };
      });

      // Play sound for new orders (not on initial load)
      if (!isInitialLoad.current && soundEnabled && mappedOrders.length > previousOrderCount.current) {
        playNewOrderSound();
        toast.success('New order received!', { 
          description: `Table ${mappedOrders[0]?.tableNumber}` 
        });
      }
      
      previousOrderCount.current = mappedOrders.length;
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
      isInitialLoad.current = false;
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

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime updates for orders
    const ordersChannel = supabase
      .channel('orders-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // Handle DELETE events optimistically
          if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
          } else {
            fetchOrders();
          }
        }
      )
      .subscribe();

    // Subscribe to new session members
    const membersChannel = supabase
      .channel('members-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_members',
        },
        (payload) => {
          if (!isInitialLoad.current && soundEnabled) {
            playNewUserSound();
            toast.info('New guest joined!', { 
              description: `${payload.new.name} joined a session` 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [soundEnabled]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      // Optimistic update
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ).filter((order) => order.status !== 'served')
      );
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      // Optimistic update - remove immediately
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        // Revert on error
        fetchOrders();
        toast.error('Failed to delete order');
        throw error;
      }
      
      toast.success('Order deleted');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
    setOrderToDelete(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Live Orders
          </h2>
          <p className="text-muted-foreground">
            {orders.length} active orders
          </p>
        </div>
        
        {/* View toggle buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <TableIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg text-foreground">No active orders</h3>
          <p className="text-muted-foreground">Orders will appear here when guests submit them</p>
        </div>
      ) : viewMode === 'grid' ? (
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
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {order.submittedBy} • {order.createdAt}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setOrderToDelete(order.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {orders.map((order) => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;

                  return (
                    <motion.tr
                      key={order.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        Table {order.tableNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.submittedBy}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm truncate block">
                          {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setOrderToDelete(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="h-12 w-12 rounded-full shadow-lg bg-card"
          title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>
        <Button
          size="icon"
          onClick={fetchOrders}
          className="h-12 w-12 rounded-full shadow-lg"
          title="Refresh orders"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The order will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToDelete && deleteOrder(orderToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
