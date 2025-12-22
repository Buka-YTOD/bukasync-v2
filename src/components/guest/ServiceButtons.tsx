import { motion } from 'framer-motion';
import { Bell, Receipt, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ServiceButtonsProps {
  tableNumber: number;
}

export function ServiceButtons({ tableNumber }: ServiceButtonsProps) {
  const handleCallWaiter = () => {
    toast.success('Waiter has been notified!', {
      description: `A waiter will be at Table ${tableNumber} shortly.`,
    });
  };

  const handleRequestBill = () => {
    toast.success('Bill requested!', {
      description: 'Your bill will be prepared shortly.',
    });
  };

  const handleAssistance = () => {
    toast.success('Assistance requested!', {
      description: 'Someone will be with you shortly.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-6 flex flex-col gap-3 z-40"
    >
      <Button
        variant="glass"
        size="iconLg"
        onClick={handleCallWaiter}
        className="shadow-soft"
      >
        <Bell className="w-5 h-5" />
      </Button>
      <Button
        variant="glass"
        size="iconLg"
        onClick={handleRequestBill}
        className="shadow-soft"
      >
        <Receipt className="w-5 h-5" />
      </Button>
      <Button
        variant="glass"
        size="iconLg"
        onClick={handleAssistance}
        className="shadow-soft"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>
    </motion.div>
  );
}
