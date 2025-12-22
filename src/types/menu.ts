export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  tags?: string[];
  allergens?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  status: 'received' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  totalAmount: number;
}

export interface ServiceRequest {
  id: string;
  tableNumber: number;
  type: 'waiter' | 'bill' | 'assistance';
  status: 'pending' | 'assigned' | 'completed';
  createdAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  brandColor?: string;
  description?: string;
}
