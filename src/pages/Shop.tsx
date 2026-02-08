import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, MapPin, ChefHat, ShoppingBag, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  address: string;
  rating: number | null;
  delivery_fee: number | null;
  estimated_delivery_mins: number | null;
  open_time: string;
  close_time: string;
  open_days: string[];
  is_active: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

function isOpenNow(restaurant: Restaurant): boolean {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  if (!restaurant.open_days.includes(day)) return false;
  const timeStr = now.toTimeString().slice(0, 5);
  return timeStr >= restaurant.open_time.slice(0, 5) && timeStr <= restaurant.close_time.slice(0, 5);
}

export default function Shop() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .eq('supports_shop', true)
      .then(({ data }) => {
        setRestaurants((data as Restaurant[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">BukaSync Shop</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search restaurants or meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base rounded-xl"
          />
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No restaurants found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((restaurant, index) => {
              const open = isOpenNow(restaurant);
              return (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/shop/${restaurant.id}`}>
                    <div className="group bg-card rounded-2xl border border-border overflow-hidden hover-lift cursor-pointer">
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={restaurant.image_url || '/placeholder.svg'}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                        <Badge
                          className={`absolute top-3 right-3 ${open ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}
                        >
                          {open ? 'Open' : 'Closed'}
                        </Badge>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-display text-lg font-bold text-primary-foreground">
                            {restaurant.name}
                          </h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {restaurant.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                            {restaurant.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {restaurant.estimated_delivery_mins} min
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {restaurant.address.split(',')[0]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Delivery: {formatPrice(restaurant.delivery_fee || 0)}
                          </span>
                          <Button variant="ghost" size="sm" className="text-primary text-xs">
                            View Menu →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
