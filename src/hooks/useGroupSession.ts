import { useState, useCallback, useMemo } from 'react';
import { CartItem, MenuItem, GroupMember, GroupOrder } from '@/types/menu';

// Color palette for group members
const MEMBER_COLORS = [
  'hsl(24, 95%, 53%)',   // Primary orange
  'hsl(262, 83%, 58%)',  // Purple
  'hsl(142, 76%, 36%)',  // Green
  'hsl(346, 77%, 49%)',  // Red
  'hsl(199, 89%, 48%)',  // Blue
  'hsl(45, 93%, 47%)',   // Yellow
  'hsl(316, 72%, 52%)',  // Pink
  'hsl(173, 80%, 40%)',  // Teal
];

export function useGroupSession(tableNumber: number) {
  const [currentUser, setCurrentUser] = useState<GroupMember | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sharedCart, setSharedCart] = useState<CartItem[]>([]);
  const [submittedOrders, setSubmittedOrders] = useState<GroupOrder[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  const joinSession = useCallback((name: string) => {
    const colorIndex = members.length % MEMBER_COLORS.length;
    const newMember: GroupMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: MEMBER_COLORS[colorIndex],
      isReady: false,
      joinedAt: new Date(),
    };
    
    setCurrentUser(newMember);
    setMembers((prev) => [...prev, newMember]);
    setIsJoined(true);
    
    return newMember;
  }, [members.length]);

  const leaveSession = useCallback(() => {
    if (!currentUser) return;
    
    setMembers((prev) => prev.filter((m) => m.id !== currentUser.id));
    // Remove items added by this user
    setSharedCart((prev) => prev.filter((item) => item.addedById !== currentUser.id));
    setCurrentUser(null);
    setIsJoined(false);
  }, [currentUser]);

  const addItem = useCallback((menuItem: MenuItem) => {
    if (!currentUser) return;

    setSharedCart((prev) => {
      // Check if this exact item was already added by the same person
      const existing = prev.find(
        (item) => item.id === menuItem.id && item.addedById === currentUser.id
      );
      
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id && item.addedById === currentUser.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [
        ...prev,
        {
          ...menuItem,
          quantity: 1,
          addedBy: currentUser.name,
          addedById: currentUser.id,
        },
      ];
    });
  }, [currentUser]);

  const removeItem = useCallback((itemId: string, addedById: string) => {
    // Only allow removing your own items
    if (!currentUser || currentUser.id !== addedById) return;
    
    setSharedCart((prev) =>
      prev.filter((item) => !(item.id === itemId && item.addedById === addedById))
    );
  }, [currentUser]);

  const updateQuantity = useCallback((itemId: string, addedById: string, quantity: number) => {
    // Only allow updating your own items
    if (!currentUser || currentUser.id !== addedById) return;

    if (quantity <= 0) {
      setSharedCart((prev) =>
        prev.filter((item) => !(item.id === itemId && item.addedById === addedById))
      );
    } else {
      setSharedCart((prev) =>
        prev.map((item) =>
          item.id === itemId && item.addedById === addedById
            ? { ...item, quantity }
            : item
        )
      );
    }
  }, [currentUser]);

  const toggleReady = useCallback(() => {
    if (!currentUser) return;

    const newReadyState = !currentUser.isReady;
    
    setCurrentUser((prev) => prev ? { ...prev, isReady: newReadyState } : null);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentUser.id ? { ...m, isReady: newReadyState } : m
      )
    );
  }, [currentUser]);

  const submitMyOrder = useCallback(() => {
    if (!currentUser) return;

    const myItems = sharedCart.filter((item) => item.addedById === currentUser.id);
    if (myItems.length === 0) return;

    const order: GroupOrder = {
      id: crypto.randomUUID(),
      sessionId: `table-${tableNumber}`,
      items: myItems,
      submittedBy: currentUser.name,
      submittedById: currentUser.id,
      status: 'received',
      createdAt: new Date(),
      totalAmount: myItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    setSubmittedOrders((prev) => [...prev, order]);
    // Remove submitted items from shared cart
    setSharedCart((prev) => prev.filter((item) => item.addedById !== currentUser.id));
    // Mark user as ready
    setCurrentUser((prev) => prev ? { ...prev, isReady: true } : null);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentUser.id ? { ...m, isReady: true } : m
      )
    );

    return order;
  }, [currentUser, sharedCart, tableNumber]);

  const submitGroupOrder = useCallback(() => {
    if (!currentUser || sharedCart.length === 0) return;

    const order: GroupOrder = {
      id: crypto.randomUUID(),
      sessionId: `table-${tableNumber}`,
      items: [...sharedCart],
      submittedBy: 'Group',
      submittedById: 'group',
      status: 'received',
      createdAt: new Date(),
      totalAmount: sharedCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    setSubmittedOrders((prev) => [...prev, order]);
    setSharedCart([]);
    // Mark everyone as ready
    setMembers((prev) => prev.map((m) => ({ ...m, isReady: true })));
    if (currentUser) {
      setCurrentUser((prev) => prev ? { ...prev, isReady: true } : null);
    }

    return order;
  }, [currentUser, sharedCart, tableNumber]);

  // Calculate totals
  const myItems = useMemo(() => {
    if (!currentUser) return [];
    return sharedCart.filter((item) => item.addedById === currentUser.id);
  }, [currentUser, sharedCart]);

  const myTotal = useMemo(() => {
    return myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [myItems]);

  const groupTotal = useMemo(() => {
    return sharedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [sharedCart]);

  const totalItems = useMemo(() => {
    return sharedCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [sharedCart]);

  const readyMembers = useMemo(() => {
    return members.filter((m) => m.isReady);
  }, [members]);

  const allReady = useMemo(() => {
    return members.length > 0 && members.every((m) => m.isReady);
  }, [members]);

  // Group items by person for display
  const itemsByPerson = useMemo(() => {
    const grouped: Record<string, { member: GroupMember | null; items: CartItem[]; total: number }> = {};
    
    sharedCart.forEach((item) => {
      if (!grouped[item.addedById]) {
        const member = members.find((m) => m.id === item.addedById) || null;
        grouped[item.addedById] = {
          member,
          items: [],
          total: 0,
        };
      }
      grouped[item.addedById].items.push(item);
      grouped[item.addedById].total += item.price * item.quantity;
    });

    return grouped;
  }, [sharedCart, members]);

  return {
    currentUser,
    members,
    sharedCart,
    submittedOrders,
    isJoined,
    myItems,
    myTotal,
    groupTotal,
    totalItems,
    readyMembers,
    allReady,
    itemsByPerson,
    joinSession,
    leaveSession,
    addItem,
    removeItem,
    updateQuantity,
    toggleReady,
    submitMyOrder,
    submitGroupOrder,
  };
}
