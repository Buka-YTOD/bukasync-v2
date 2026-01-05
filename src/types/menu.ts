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
  addedBy: string; // Name of person who added the item
  addedById: string; // Unique ID of the person
}

export interface GroupMember {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
  joinedAt: Date;
}

export interface GroupSession {
  id: string;
  tableNumber: number;
  members: GroupMember[];
  createdAt: Date;
}

export interface GroupOrder {
  id: string;
  sessionId: string;
  items: CartItem[];
  submittedBy: string;
  submittedById: string;
  status: 'received' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  totalAmount: number;
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
