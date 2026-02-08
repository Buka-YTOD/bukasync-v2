import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Store, Minus, Plus, Trash2, Check, CreditCard, Smartphone,
  ArrowLeft, MapPin, User, Phone, Mail, FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import type { useShopCart } from '@/hooks/useShopCart';

type FulfillmentType = 'delivery' | 'pickup';
type Step = 'cart' | 'details' | 'payment' | 'processing' | 'success';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: ReturnType<typeof useShopCart>;
  restaurant: { id: string; name: string; delivery_fee: number | null; estimated_delivery_mins: number | null };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

export function ShopCheckoutSheet({ isOpen, onClose, cart, restaurant }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('cart');
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);

  const deliveryFee = fulfillment === 'delivery' ? (restaurant.delivery_fee || 0) : 0;
  const total = cart.subtotal + deliveryFee;

  const canProceedToPayment = name.trim() && phone.trim() && (fulfillment === 'pickup' || address.trim());

  const handlePayment = async () => {
    setStep('processing');
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        // Save order to DB
        supabase.from('shop_orders').insert({
          restaurant_id: restaurant.id,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || null,
          delivery_address: fulfillment === 'delivery' ? address.trim() : null,
          fulfillment_type: fulfillment,
          items: cart.items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          subtotal: cart.subtotal,
          delivery_fee: deliveryFee,
          total_amount: total,
          payment_status: 'paid',
          notes: notes.trim() || null,
        }).then(({ error }) => {
          if (error) {
            toast({ title: 'Error', description: 'Failed to place order', variant: 'destructive' });
            setStep('payment');
          } else {
            setStep('success');
          }
        });
      }
    }, 200);
  };

  const handleDone = () => {
    cart.clearCart();
    setStep('cart');
    setName(''); setPhone(''); setEmail(''); setAddress(''); setNotes('');
    setProgress(0);
    onClose();
  };

  const handleClose = () => {
    if (step === 'processing') return;
    if (step === 'success') { handleDone(); return; }
    setStep('cart');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">
            {step === 'cart' && 'Your Cart'}
            {step === 'details' && 'Delivery Details'}
            {step === 'payment' && 'Payment'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Order Placed!'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 py-4">
          <AnimatePresence mode="wait">
            {/* CART STEP */}
            {step === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-sm text-muted-foreground">From: <span className="font-medium text-foreground">{restaurant.name}</span></p>
                
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-primary font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-full" onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}>
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </Button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-full" onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Fulfillment toggle */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Fulfillment</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={fulfillment === 'delivery' ? 'default' : 'outline'}
                      onClick={() => setFulfillment('delivery')}
                      className="gap-2"
                    >
                      <Truck className="w-4 h-4" /> Delivery
                    </Button>
                    <Button
                      variant={fulfillment === 'pickup' ? 'default' : 'outline'}
                      onClick={() => setFulfillment('pickup')}
                      className="gap-2"
                    >
                      <Store className="w-4 h-4" /> Pickup
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                  </div>
                  {fulfillment === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-medium">{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full" onClick={() => setStep('details')}>
                  Continue
                </Button>
              </motion.div>
            )}

            {/* DETAILS STEP */}
            {step === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone *</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" className="rounded-xl" />
                  </div>
                  {fulfillment === 'delivery' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Delivery Address *</label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter delivery address" className="rounded-xl" />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Notes</label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions?" className="rounded-xl resize-none" rows={2} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setStep('cart')} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                  <Button variant="hero" className="flex-1" disabled={!canProceedToPayment} onClick={() => setStep('payment')}>
                    Continue to Pay
                  </Button>
                </div>
              </motion.div>
            )}

            {/* PAYMENT STEP */}
            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Total to pay</p>
                  <p className="text-3xl font-bold text-primary font-display">{formatPrice(total)}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Choose payment method</p>
                  <Button variant="outline" size="lg" className="w-full gap-3 h-14 rounded-xl" onClick={handlePayment}>
                    <Smartphone className="w-5 h-5 text-primary" />
                    <span>Pay via App (Bank / Card)</span>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full gap-3 h-14 rounded-xl" onClick={handlePayment}>
                    <CreditCard className="w-5 h-5 text-accent" />
                    <span>Pay on {fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                  </Button>
                </div>

                <Button variant="ghost" onClick={() => setStep('details')} className="w-full"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
              </motion.div>
            )}

            {/* PROCESSING */}
            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center space-y-6 py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-lg font-semibold">Processing Payment</p>
                <Progress value={progress} className="w-48 h-2" />
              </motion.div>
            )}

            {/* SUCCESS */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center space-y-6 py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center"
                >
                  <Check className="w-12 h-12 text-success" />
                </motion.div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold font-display">Order Placed! 🎉</h3>
                  <p className="text-muted-foreground text-sm">
                    {fulfillment === 'delivery'
                      ? `Your order will be delivered in ~${restaurant.estimated_delivery_mins} minutes`
                      : 'Your order will be ready for pickup soon'}
                  </p>
                  <p className="text-primary font-bold text-2xl">{formatPrice(total)}</p>
                </div>
                <Button variant="hero" size="xl" onClick={handleDone}>Back to Shop</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
