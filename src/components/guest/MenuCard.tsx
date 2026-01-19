import { motion } from 'framer-motion';
import { Plus, Flame, AlertTriangle, ChevronRight } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
  currentUserColor?: string;
}

export function MenuCard({ item, onAddToCart, onViewDetails, currentUserColor }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const hasAllergens = item.allergens && item.allergens.length > 0;
  const hasCustomizations = item.customizationOptions && item.customizationOptions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails(item)}
    >
      <div className="aspect-square overflow-hidden relative">
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
        
        {/* Allergen indicator */}
        {hasAllergens && (
          <div className="absolute top-2 right-2">
            <div className="bg-warning/90 text-warning-foreground rounded-full p-1.5">
              <AlertTriangle className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* View details hint on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-background text-sm font-medium flex items-center gap-1">
            View Details <ChevronRight className="w-4 h-4" />
          </span>
        </div>
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
          {hasCustomizations && (
            <Badge variant="outline" className="text-xs">
              Customizable
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-xl font-bold text-primary">
            {formatPrice(item.price)}
          </span>
          <Button
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
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
