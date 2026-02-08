import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Clock, MapPin, ShoppingCart, Plus, Minus, Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useShopCart } from '@/hooks/useShopCart';
import { ShopCheckoutSheet } from '@/components/shop/ShopCheckoutSheet';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  address: string;
  rating: number | null;
  delivery_fee: number | null;
  estimated_delivery_mins: number | null;
}

interface ShopMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

export default function ShopRestaurant() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<ShopMenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const cart = useShopCart();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('restaurants').select('*').eq('id', id).maybeSingle(),
      supabase.from('shop_menu_items').select('*').eq('restaurant_id', id).eq('is_available', true),
    ]).then(([rRes, mRes]) => {
      setRestaurant(rRes.data as Restaurant | null);
      setMenuItems((mRes.data as ShopMenuItem[]) || []);
      setLoading(false);
    });
  }, [id]);

  const categories = useMemo(() => {
    const cats = [...new Set(menuItems.map((i) => i.category))];
    return ['All', ...cats];
  }, [menuItems]);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, search]);

  const getItemQty = (itemId: string) => cart.items.find((i) => i.id === itemId)?.quantity || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Restaurant not found</p>
        <Link to="/shop"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-52">
        <img
          src={restaurant.image_url || '/placeholder.svg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur" onClick={() => navigate('/shop')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-display text-2xl font-bold text-primary-foreground">{restaurant.name}</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">{restaurant.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-primary-foreground/70">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-warning fill-warning" /> {restaurant.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {restaurant.estimated_delivery_mins} min
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {restaurant.address.split(',')[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <Input
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl"
        />

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? 'default' : 'secondary'}
              className="cursor-pointer whitespace-nowrap px-4 py-1.5"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Menu items */}
        <div className="grid gap-3">
          {filtered.map((item) => {
            const qty = getItemQty(item.id);
            return (
              <motion.div
                key={item.id}
                layout
                className="flex gap-3 bg-card rounded-xl border border-border p-3"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                  <p className="text-primary font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-end">
                  {qty === 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() =>
                        cart.addItem({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image_url: item.image_url,
                          restaurant_id: item.restaurant_id,
                        })
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-7 w-7 p-0"
                        onClick={() => cart.updateQuantity(item.id, qty - 1)}
                      >
                        {qty === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      </Button>
                      <span className="text-sm font-bold w-5 text-center">{qty}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-7 w-7 p-0"
                        onClick={() => cart.updateQuantity(item.id, qty + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating cart bar */}
      <AnimatePresence>
        {cart.totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border"
          >
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={() => setCheckoutOpen(true)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              View Cart ({cart.totalItems}) • {formatPrice(cart.subtotal)}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <ShopCheckoutSheet
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        restaurant={restaurant}
      />
    </div>
  );
}
