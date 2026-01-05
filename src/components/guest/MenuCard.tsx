import { motion } from 'framer-motion';
import { Plus, Flame } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  currentUserColor?: string;
}

export function MenuCard({ item, onAddToCart, currentUserColor }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="text-background font-medium">Sold Out</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
            {item.name}
          </h3>
          {item.tags?.includes('spicy') && (
            <Flame className="w-4 h-4 text-accent flex-shrink-0" />
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {item.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs capitalize">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-xl font-bold text-primary">
            {formatPrice(item.price)}
          </span>
          <Button
            size="icon"
            onClick={() => onAddToCart(item)}
            disabled={!item.available}
            className="rounded-full"
            style={currentUserColor ? { 
              backgroundColor: currentUserColor,
              borderColor: currentUserColor 
            } : undefined}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
