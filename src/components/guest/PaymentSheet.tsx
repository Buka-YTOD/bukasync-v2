import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Users, 
  User, 
  Check, 
  ExternalLink,
  Wallet,
  Split,
  PartyPopper
} from 'lucide-react';
import { GroupMember, GroupOrder } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type PaymentMethod = 'app' | 'pos';
type PaymentType = 'individual' | 'full';

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onEndSession: () => void;
  currentUser: GroupMember | null;
  members: GroupMember[];
  submittedOrders: GroupOrder[];
  totalAmount: number;
  myTotal: number;
}

export function PaymentSheet({
  isOpen,
  onClose,
  onEndSession,
  currentUser,
  members,
  submittedOrders,
  totalAmount,
  myTotal,
}: PaymentSheetProps) {
  const [step, setStep] = useState<'method' | 'type' | 'processing' | 'success' | 'tappa'>('method');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    // Both methods ask who's paying
    setStep('type');
  };

  const handleTypeSelect = (type: PaymentType) => {
    setPaymentType(type);
    
    if (paymentMethod === 'pos') {
      // For POS, go directly to success (staff handles payment)
      if (type === 'full' && members.length > 1) {
        setStep('tappa');
      } else {
        setStep('success');
      }
    } else {
      // For app payment, simulate processing
      setStep('processing');
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProcessingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (type === 'full' && members.length > 1) {
              setStep('tappa');
            } else {
              setStep('success');
            }
          }, 500);
        }
      }, 200);
    }
  };

  const handleComplete = () => {
    setStep('method');
    setPaymentMethod(null);
    setPaymentType(null);
    setProcessingProgress(0);
    onEndSession();
    onClose();
  };

  const handleCloseSheet = () => {
    setStep('method');
    setPaymentMethod(null);
    setPaymentType(null);
    setProcessingProgress(0);
    onClose();
  };

  const amountToPay = paymentType === 'individual' ? myTotal : totalAmount;
  const splitAmount = members.length > 1 ? totalAmount / members.length : totalAmount;

  return (
    <Sheet open={isOpen} onOpenChange={handleCloseSheet}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Payment
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col py-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Payment Method Selection */}
            {step === 'method' && (
              <motion.div
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">How would you like to pay?</h3>
                  <p className="text-muted-foreground text-sm">
                    Total: <span className="text-primary font-bold text-lg">{formatPrice(totalAmount)}</span>
                  </p>
                </div>

                <div className="grid gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMethodSelect('app')}
                    className="p-6 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Pay via App</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay instantly using your bank app or card
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="secondary">Bank Transfer</Badge>
                          <Badge variant="secondary">Card</Badge>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMethodSelect('pos')}
                    className="p-6 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-accent/10">
                        <CreditCard className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Pay at POS</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay with cash or card at the counter
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="secondary">Cash</Badge>
                          <Badge variant="secondary">Card</Badge>
                          <Badge variant="secondary">POS</Badge>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Type (Individual vs Full) */}
            {step === 'type' && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Who's paying?</h3>
                  <p className="text-muted-foreground text-sm">
                    Choose how to split the bill
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Pay for my items only */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeSelect('individual')}
                    className="p-6 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Pay My Share</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Only pay for items you ordered
                        </p>
                        <p className="text-primary font-bold text-lg mt-2">
                          {formatPrice(myTotal)}
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Pay for everyone */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeSelect('full')}
                    className="p-6 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-colors relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-success/10">
                        <Users className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Pay for Everyone</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Cover the full bill for your group
                        </p>
                        <p className="text-primary font-bold text-lg mt-2">
                          {formatPrice(totalAmount)}
                        </p>
                        {members.length > 1 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Get reimbursed easily with Tappa
                          </p>
                        )}
                      </div>
                    </div>
                    {members.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                          <Split className="w-3 h-3 mr-1" />
                          Split Later
                        </Badge>
                      </div>
                    )}
                  </motion.button>

                  {/* Split equally option */}
                  {members.length > 1 && (
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">
                        Split equally: <span className="font-semibold text-foreground">{formatPrice(splitAmount)}</span> per person
                      </p>
                    </div>
                  )}
                </div>

                <Button variant="ghost" onClick={() => setStep('method')} className="w-full">
                  Back
                </Button>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center space-y-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary"
                />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Processing Payment</h3>
                  <p className="text-muted-foreground text-sm">
                    {formatPrice(amountToPay)}
                  </p>
                </div>
                <Progress value={processingProgress} className="w-48 h-2" />
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center justify-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center"
                >
                  <Check className="w-12 h-12 text-success" />
                </motion.div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">
                    {paymentMethod === 'pos' ? 'Ready to Pay!' : 'Payment Successful!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {paymentMethod === 'pos' 
                      ? 'Please proceed to the counter to complete payment'
                      : 'Thank you for dining with us!'
                    }
                  </p>
                  <p className="text-primary font-bold text-2xl mt-4">
                    {formatPrice(paymentMethod === 'pos' ? totalAmount : amountToPay)}
                  </p>
                </div>
                <Button variant="hero" size="xl" onClick={handleComplete} className="mt-4">
                  Done
                </Button>
              </motion.div>
            )}

            {/* Step 5: Tappa Promotion (after paying for all) */}
            {step === 'tappa' && (
              <motion.div
                key="tappa"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col space-y-6"
              >
                {/* Success header */}
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-2"
                  >
                    <Check className="w-8 h-8 text-success" />
                  </motion.div>
                  <h3 className="text-xl font-semibold">
                    {paymentMethod === 'pos' ? 'Ready to Pay!' : 'Payment Successful!'}
                  </h3>
                  <p className="text-primary font-bold text-2xl">{formatPrice(totalAmount)}</p>
                </div>

                {/* Tappa Promo Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-[hsl(168,80%,25%)] to-[hsl(168,80%,35%)] text-white overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative space-y-4">
                    <div className="text-center space-y-2">
                      <h4 className="font-bold text-xl">Did you know?</h4>
                      <p className="text-white/90">
                        With <span className="font-bold">Tappa</span>, you can send a payment link to your friends and get reimbursed instantly!
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
                      <div className="flex -space-x-2">
                        {members.filter(m => m.id !== currentUser?.id).slice(0, 4).map((member) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full border-2 border-[hsl(168,80%,30%)] flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Your friends owe you:
                        </p>
                        <p className="text-lg font-bold">
                          {formatPrice(totalAmount - (totalAmount / members.length))}
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="secondary"
                      size="lg"
                      className="w-full bg-white text-[hsl(168,80%,30%)] hover:bg-white/90"
                    >
                      <a
                        href="https://pay-link-naija.lovable.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Split className="w-4 h-4 mr-2" />
                        Get Reimbursed with Tappa
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </motion.div>

                <Button variant="ghost" onClick={handleComplete} className="w-full">
                  No thanks, I'm done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
