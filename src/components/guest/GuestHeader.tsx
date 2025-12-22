import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';

interface GuestHeaderProps {
  restaurantName: string;
  tableNumber: number;
}

export function GuestHeader({ restaurantName, tableNumber }: GuestHeaderProps) {
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
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
            BS
          </div>
        </div>
      </div>
    </motion.header>
  );
}
