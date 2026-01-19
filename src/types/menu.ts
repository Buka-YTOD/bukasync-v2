// Common allergens for filtering
export const COMMON_ALLERGENS = [
  'gluten',
  'dairy',
  'eggs',
  'fish',
  'shellfish',
  'tree nuts',
  'peanuts',
  'soy',
  'sesame',
] as const;

export type Allergen = typeof COMMON_ALLERGENS[number];

// Customization option for dishes (e.g., steak doneness)
export interface CustomizationOption {
  id: string;
  name: string;
  label: string;
  choices: {
    value: string;
    label: string;
    priceModifier?: number; // Optional price change
  }[];
  required: boolean;
}

// Extended menu item with full details
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  tags?: string[];
  allergens?: Allergen[];
  ingredients?: string[];
  customizationOptions?: CustomizationOption[];
  // AI-generated fields (cached or fetched on demand)
  aiDetails?: {
    fullDescription?: string;
    pairingSuggestions?: string[];
    nutritionHighlights?: string;
    preparationInfo?: string;
  };
}

// Selected customization for a cart item
export interface SelectedCustomization {
  optionId: string;
  optionName: string;
  selectedValue: string;
  selectedLabel: string;
  priceModifier?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  addedBy: string; // Name of person who added the item
  addedById: string; // Unique ID of the person
  comment?: string; // Special instructions for the dish
  customizations?: SelectedCustomization[];
  customizationPriceModifier?: number; // Total price adjustment from customizations
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
