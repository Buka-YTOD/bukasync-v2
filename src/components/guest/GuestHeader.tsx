import { motion } from 'framer-motion';
import { MapPin, Users, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface GuestHeaderProps {
  restaurantName: string;
  tableNumber: number;
  sessionCode?: string | null;
}

export function GuestHeader({ restaurantName, tableNumber, sessionCode }: GuestHeaderProps) {
  const copyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      toast.success('Code copied!', { description: 'Share with friends to join' });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {restaurantName}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Table {tableNumber}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Group Order
              </span>
            </div>
          </div>
          {sessionCode && (
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <span className="font-mono font-bold text-primary tracking-wider">{sessionCode}</span>
              <Copy className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}