import { useState } from 'react';
import { motion } from 'framer-motion';
import { GuestHeader } from '@/components/guest/GuestHeader';
import { CategoryTabs } from '@/components/guest/CategoryTabs';
import { MenuCard } from '@/components/guest/MenuCard';
import { CartSheet } from '@/components/guest/CartSheet';
import { ServiceButtons } from '@/components/guest/ServiceButtons';
import { useCart } from '@/hooks/useCart';
import { menuItems, categories } from '@/data/menuData';
import { toast } from 'sonner';

export default function GuestMenu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const cart = useCart();

  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const handleSubmitOrder = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    toast.success('Order submitted!', {
      description: 'Your order has been sent to the kitchen.',
    });
    cart.clearCart();
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <GuestHeader restaurantName="Mama's Kitchen" tableNumber={7} />

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <MenuCard
                item={item}
                onAddToCart={(menuItem) => {
                  cart.addItem(menuItem);
                  toast.success(`Added ${menuItem.name} to cart`);
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>

      <ServiceButtons tableNumber={7} />

      {cart.totalItems > 0 && (
        <CartSheet
          items={cart.items}
          totalItems={cart.totalItems}
          totalAmount={cart.totalAmount}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onSubmitOrder={handleSubmitOrder}
        />
      )}
    </div>
  );
}
