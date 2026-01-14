import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Receipt, HelpCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ServiceButtonsProps {
  tableNumber: number;
}

export function ServiceButtons({ tableNumber }: ServiceButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCallWaiter = () => {
    toast.success('Waiter has been notified!', {
      description: `A waiter will be at Table ${tableNumber} shortly.`,
    });
    setIsOpen(false);
  };

  const handleRequestBill = () => {
    toast.success('Bill requested!', {
      description: 'Your bill will be prepared shortly.',
    });
    setIsOpen(false);
  };

  const handleAssistance = () => {
    toast.success('Assistance requested!', {
      description: 'Someone will be with you shortly.',
    });
    setIsOpen(false);
  };

  const actions = [
    { icon: Bell, label: 'Call Waiter', onClick: handleCallWaiter, color: 'bg-primary' },
    { icon: Receipt, label: 'Get Check', onClick: handleRequestBill, color: 'bg-success' },
    { icon: HelpCircle, label: 'Help', onClick: handleAssistance, color: 'bg-warning' },
  ];

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 items-end"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 flex-row-reverse"
              >
                <Button
                  variant="glass"
                  size="iconLg"
                  onClick={action.onClick}
                  className="shadow-lg"
                >
                  <action.icon className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium text-foreground bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-soft whitespace-nowrap">
                  {action.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          size="iconLg"
          onClick={() => setIsOpen(!isOpen)}
          className={`shadow-lg transition-colors ${
            isOpen ? 'bg-muted text-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </Button>
      </motion.div>
    </div>
  );
}
