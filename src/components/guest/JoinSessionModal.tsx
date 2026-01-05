import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Utensils, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface JoinSessionModalProps {
  isOpen: boolean;
  tableNumber: number;
  restaurantName: string;
  onJoin: (name: string) => void;
}

export function JoinSessionModal({
  isOpen,
  tableNumber,
  restaurantName,
  onJoin,
}: JoinSessionModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    onJoin(name.trim());
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Utensils className="w-8 h-8 text-primary" />
          </motion.div>
          <DialogTitle className="font-display text-2xl text-center">
            Welcome to {restaurantName}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Table {tableNumber}</span>
            </div>
            <p className="mt-3 text-muted-foreground text-sm">
              Enter your name to join the group order. Everyone at your table can see and order together!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="text-center text-lg h-12"
                autoFocus
                maxLength={20}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-destructive text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={!name.trim()}
            >
              Join Table
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p>
              <strong className="text-foreground">Group ordering:</strong> See what others add to the cart in real-time. Submit together or individually!
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
