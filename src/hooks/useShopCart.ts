import { useState, useCallback } from 'react';

export interface ShopCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  restaurant_id: string;
}

export function useShopCart() {
  const [items, setItems] = useState<ShopCartItem[]>([]);

  const addItem = useCallback((item: Omit<ShopCartItem, 'quantity'>) => {
    setItems((prev) => {
      // Prevent mixing restaurants
      if (prev.length > 0 && prev[0].restaurant_id !== item.restaurant_id) {
        return [{ ...item, quantity: 1 }];
      }
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal };
}
