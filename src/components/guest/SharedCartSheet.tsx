import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, Users, Send, UserCheck, Clock, Wallet } from 'lucide-react';
import { CartItem, GroupMember, GroupOrder } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface SharedCartSheetProps {
  currentUser: GroupMember | null;
  members: GroupMember[];
  sharedCart: CartItem[];
  submittedOrders: GroupOrder[];
  totalItems: number;
  groupTotal: number;
  myTotal: number;
  submittedTotal: number;
  itemsByPerson: Record<string, { member: GroupMember | null; items: CartItem[]; total: number }>;
  readyMembers: GroupMember[];
  allReady: boolean;
  onUpdateQuantity: (itemId: string, addedById: string, quantity: number) => void;
  onRemoveItem: (itemId: string, addedById: string) => void;
  onToggleReady: () => void;
  onSubmitMyOrder: () => void;
  onSubmitGroupOrder: () => void;
  onOpenPayment: () => void;
}

export function SharedCartSheet({
  currentUser,
  members,
  sharedCart,
  submittedOrders,
  totalItems,
  groupTotal,
  myTotal,
  submittedTotal,
  itemsByPerson,
  readyMembers,
  allReady,
  onUpdateQuantity,
  onRemoveItem,
  onToggleReady,
  onSubmitMyOrder,
  onSubmitGroupOrder,
  onOpenPayment,
}: SharedCartSheetProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'received': return 25;
      case 'preparing': return 50;
      case 'ready': return 75;
      case 'served': return 100;
      default: return 0;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'Order Received';
      case 'preparing': return 'Preparing...';
      case 'ready': return 'Ready for Pickup';
      case 'served': return 'Served';
      default: return status;
    }
  };

  const myItems = currentUser ? sharedCart.filter((item) => item.addedById === currentUser.id) : [];
  const hasMyItems = myItems.length > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="hero" 
          size="lg" 
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-glow safe-area-bottom"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="ml-2">{totalItems} Items</span>
          <span className="mx-2">•</span>
          <span className="font-bold">{formatPrice(groupTotal)}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 h-[100dvh] max-h-[100dvh]">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Group Order
          </SheetTitle>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              {members.length} {members.length === 1 ? 'person' : 'people'} at the table
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {readyMembers.length}/{members.length} ready
            </span>
          </div>
        </SheetHeader>

        <Tabs defaultValue="cart" className="flex-1 flex flex-col">
          <TabsList className="mx-6">
            <TabsTrigger value="cart" className="flex-1">
              Cart ({totalItems})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">
              Orders ({submittedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {Object.keys(itemsByPerson).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64 text-muted-foreground"
                  >
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Start adding items to order!</p>
                  </motion.div>
                ) : (
                  Object.entries(itemsByPerson).map(([personId, { member, items, total }]) => (
                    <motion.div
                      key={personId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      {/* Person header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: member?.color || 'hsl(var(--muted))' }}
                          >
                            {member?.name.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-sm">
                            {member?.name || 'Unknown'}
                            {personId === currentUser?.id && (
                              <span className="text-primary ml-1">(You)</span>
                            )}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(total)}
                        </span>
                      </div>

                      {/* Items */}
                      {items.map((item) => (
                        <motion.div
                          key={`${item.id}-${item.addedById}`}
                          layout
                          className="flex gap-3 p-3 bg-muted/50 rounded-xl ml-4"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm truncate">
                              {item.name}
                            </h4>
                            <p className="text-primary font-semibold text-sm">
                              {formatPrice(item.price)}
                            </p>
                            
                            {/* Quantity controls - only for own items */}
                            {personId === currentUser?.id ? (
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onUpdateQuantity(item.id, item.addedById, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-6 text-center font-medium text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onUpdateQuantity(item.id, item.addedById, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive ml-auto"
                                  onClick={() => onRemoveItem(item.id, item.addedById)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                Qty: {item.quantity}
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      <Separator className="my-3" />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Bottom actions */}
            {sharedCart.length > 0 && (
              <div className="border-t border-border px-6 py-4 space-y-4 bg-background">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Your items</span>
                    <span className="font-medium">{formatPrice(myTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Group Total</span>
                    <span className="font-bold text-lg text-primary">{formatPrice(groupTotal)}</span>
                  </div>
                </div>

                {/* Ready toggle */}
                <Button
                  variant={currentUser?.isReady ? 'success' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={onToggleReady}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {currentUser?.isReady ? "I'm Ready!" : "Mark as Ready"}
                </Button>

                {/* Submit buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="soft"
                    size="lg"
                    onClick={onSubmitMyOrder}
                    disabled={!hasMyItems}
                    className="flex-col h-auto py-3"
                  >
                    <Send className="w-4 h-4 mb-1" />
                    <span className="text-xs">Submit Mine</span>
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={onSubmitGroupOrder}
                    disabled={!allReady || sharedCart.length === 0}
                    className="flex-col h-auto py-3"
                  >
                    <Users className="w-4 h-4 mb-1" />
                    <span className="text-xs">
                      {allReady ? 'Submit All' : `${readyMembers.length}/${members.length} Ready`}
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="popLayout">
                {submittedOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64 text-muted-foreground"
                  >
                    <Clock className="w-16 h-16 mb-4 opacity-50" />
                    <p>No orders yet</p>
                    <p className="text-sm">Your orders will appear here</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {submittedOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-muted/50 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {order.submittedBy === 'Group' ? (
                                <><Users className="w-3 h-3 mr-1" /> Group</>
                              ) : (
                                order.submittedBy
                              )}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="font-semibold text-primary">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{getStatusLabel(order.status)}</span>
                            <span className="text-primary font-medium">{getStatusProgress(order.status)}%</span>
                          </div>
                          <Progress value={getStatusProgress(order.status)} className="h-2" />
                        </div>

                        {/* Items list */}
                        <div className="text-sm text-muted-foreground">
                          {order.items.map((item) => (
                            <div key={`${item.id}-${item.addedById}`} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Payment Button - shown when there are submitted orders */}
            {submittedOrders.length > 0 && (
              <div className="border-t border-border px-6 py-4 bg-background space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total to Pay</span>
                  <span className="font-bold text-xl text-primary">{formatPrice(submittedTotal)}</span>
                </div>
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={onOpenPayment}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Pay Now
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
