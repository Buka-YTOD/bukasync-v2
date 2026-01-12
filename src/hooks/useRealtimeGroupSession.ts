import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, MenuItem, GroupMember, GroupOrder } from '@/types/menu';
import { Json } from '@/integrations/supabase/types';

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

function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

interface DbCartItem {
  id: string;
  session_id: string;
  member_id: string;
  menu_item_id: string;
  menu_item_name: string;
  menu_item_price: number;
  menu_item_image: string | null;
  menu_item_category: string | null;
  quantity: number;
  created_at: string;
}

interface DbMember {
  id: string;
  session_id: string;
  name: string;
  color: string;
  is_ready: boolean;
  joined_at: string;
}

interface DbOrder {
  id: string;
  session_id: string;
  submitted_by_id: string | null;
  submitted_by_name: string;
  status: string;
  total_amount: number;
  items: Json;
  created_at: string;
}

// Helper to convert cart items from DB to CartItem type
function mapCartItem(item: DbCartItem & { session_members?: { name: string } | null }): CartItem {
  return {
    id: item.menu_item_id,
    name: item.menu_item_name,
    price: item.menu_item_price,
    image: item.menu_item_image || '',
    category: item.menu_item_category || '',
    description: '',
    available: true,
    quantity: item.quantity,
    addedBy: item.session_members?.name || 'Unknown',
    addedById: item.member_id,
  };
}

// Helper to convert order from DB to GroupOrder type
function mapOrder(o: DbOrder): GroupOrder {
  return {
    id: o.id,
    sessionId: o.session_id,
    items: (o.items as unknown as CartItem[]) || [],
    submittedBy: o.submitted_by_name,
    submittedById: o.submitted_by_id || 'group',
    status: o.status as 'received' | 'preparing' | 'ready' | 'served',
    createdAt: new Date(o.created_at),
    totalAmount: o.total_amount,
  };
}

// localStorage key for persisting member identity
const STORAGE_KEY = 'dining_session_member';

interface StoredMember {
  memberId: string;
  sessionId: string;
  tableNumber: number;
}

function getStoredMember(): StoredMember | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setStoredMember(data: StoredMember | null) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useRealtimeGroupSession(tableNumber: number) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<GroupMember | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [sharedCart, setSharedCart] = useState<CartItem[]>([]);
  const [submittedOrders, setSubmittedOrders] = useState<GroupOrder[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingSession, setExistingSession] = useState<{ id: string; code: string } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check for existing active session and restore member identity
  useEffect(() => {
    const checkAndRestoreSession = async () => {
      setCheckingSession(true);
      try {
        // First check if we have a stored member identity for this table
        const storedMember = getStoredMember();
        
        if (storedMember && storedMember.tableNumber === tableNumber) {
          // Verify the session is still active and member still exists
          const [sessionResult, memberResult] = await Promise.all([
            supabase
              .from('dining_sessions')
              .select('id, session_code, status')
              .eq('id', storedMember.sessionId)
              .single(),
            supabase
              .from('session_members')
              .select('*')
              .eq('id', storedMember.memberId)
              .single(),
          ]);

          if (
            sessionResult.data?.status === 'active' &&
            memberResult.data
          ) {
            // Restore the session!
            const member = memberResult.data;
            const restoredMember: GroupMember = {
              id: member.id,
              name: member.name,
              color: member.color,
              isReady: member.is_ready,
              joinedAt: new Date(member.joined_at),
            };

            // Fetch all session data
            const [membersRes, cartRes, ordersRes] = await Promise.all([
              supabase.from('session_members').select('*').eq('session_id', storedMember.sessionId).order('joined_at', { ascending: true }),
              supabase.from('cart_items').select('*, session_members(name)').eq('session_id', storedMember.sessionId),
              supabase.from('orders').select('*').eq('session_id', storedMember.sessionId).order('created_at', { ascending: true }),
            ]);

            setSessionId(storedMember.sessionId);
            setSessionCode(sessionResult.data.session_code);
            setCurrentUser(restoredMember);
            
            if (membersRes.data) {
              setMembers(membersRes.data.map((m) => ({
                id: m.id,
                name: m.name,
                color: m.color,
                isReady: m.is_ready,
                joinedAt: new Date(m.joined_at),
              })));
            }

            if (cartRes.data) {
              setSharedCart(cartRes.data.map((item) => mapCartItem(item as DbCartItem & { session_members: { name: string } })));
            }

            if (ordersRes.data) {
              setSubmittedOrders(ordersRes.data.map((o) => mapOrder(o as unknown as DbOrder)));
            }

            setIsJoined(true);
            setCheckingSession(false);
            return;
          } else {
            // Session ended or member removed, clear storage
            setStoredMember(null);
          }
        }

        // No valid stored session, check for any active session on this table
        const { data: session } = await supabase
          .from('dining_sessions')
          .select('id, session_code')
          .eq('table_number', tableNumber)
          .eq('status', 'active')
          .single();

        if (session) {
          setExistingSession({ id: session.id, code: session.session_code });
        } else {
          setExistingSession(null);
        }
      } catch (error) {
        // No existing session found, that's fine
        setExistingSession(null);
        setStoredMember(null);
      } finally {
        setCheckingSession(false);
      }
    };

    checkAndRestoreSession();
  }, [tableNumber]);

  // Auto-join existing session with just a name
  const joinExistingSession = useCallback(async (name: string) => {
    if (!existingSession) return;
    
    setIsLoading(true);
    try {
      // Get current member count for color assignment
      const { data: existingMembers } = await supabase
        .from('session_members')
        .select('*')
        .eq('session_id', existingSession.id);

      const colorIndex = (existingMembers?.length || 0) % MEMBER_COLORS.length;

      // Add the new member
      const { data: member, error: memberError } = await supabase
        .from('session_members')
        .insert({
          session_id: existingSession.id,
          name: name.trim(),
          color: MEMBER_COLORS[colorIndex],
          is_ready: false,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      const newMember: GroupMember = {
        id: member.id,
        name: member.name,
        color: member.color,
        isReady: false,
        joinedAt: new Date(member.joined_at),
      };

      // Fetch all data for this session
      const [membersResult, cartResult, ordersResult] = await Promise.all([
        supabase.from('session_members').select('*').eq('session_id', existingSession.id).order('joined_at', { ascending: true }),
        supabase.from('cart_items').select('*, session_members(name)').eq('session_id', existingSession.id),
        supabase.from('orders').select('*').eq('session_id', existingSession.id).order('created_at', { ascending: true }),
      ]);

      // Save member identity to localStorage
      setStoredMember({
        memberId: member.id,
        sessionId: existingSession.id,
        tableNumber,
      });

      setSessionId(existingSession.id);
      setSessionCode(existingSession.code);
      setCurrentUser(newMember);
      
      if (membersResult.data) {
        setMembers(membersResult.data.map((m) => ({
          id: m.id,
          name: m.name,
          color: m.color,
          isReady: m.is_ready,
          joinedAt: new Date(m.joined_at),
        })));
      }

      if (cartResult.data) {
        setSharedCart(cartResult.data.map((item) => mapCartItem(item as DbCartItem & { session_members: { name: string } })));
      }

      if (ordersResult.data) {
        setSubmittedOrders(ordersResult.data.map((o) => mapOrder(o as unknown as DbOrder)));
      }

      setIsJoined(true);

      return { member: newMember };
    } catch (error) {
      console.error('Error joining existing session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [existingSession, tableNumber]);

  // Subscribe to realtime updates when we have a session
  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to members changes
    const membersChannel = supabase
      .channel(`members-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_members',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Refetch members on any change
          const { data } = await supabase
            .from('session_members')
            .select('*')
            .eq('session_id', sessionId)
            .order('joined_at', { ascending: true });
          
          if (data) {
            setMembers(data.map((m) => ({
              id: m.id,
              name: m.name,
              color: m.color,
              isReady: m.is_ready,
              joinedAt: new Date(m.joined_at),
            })));
          }
        }
      )
      .subscribe();

    // Subscribe to cart changes
    const cartChannel = supabase
      .channel(`cart-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Refetch cart on any change
          const { data: cartData } = await supabase
            .from('cart_items')
            .select('*, session_members(name)')
            .eq('session_id', sessionId);
          
          if (cartData) {
            setSharedCart(cartData.map((item) => mapCartItem(item as DbCartItem & { session_members: { name: string } })));
          }
        }
      )
      .subscribe();

    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel(`orders-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Refetch orders on any change
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });
          
          if (data) {
            setSubmittedOrders(data.map((o) => mapOrder(o as unknown as DbOrder)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(cartChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [sessionId]);

  // Create or join a session
  const createSession = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      const code = generateSessionCode();
      
      // Create the session
      const { data: session, error: sessionError } = await supabase
        .from('dining_sessions')
        .insert({
          table_number: tableNumber,
          session_code: code,
          status: 'active',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Add the creating user as first member
      const colorIndex = 0;
      const { data: member, error: memberError } = await supabase
        .from('session_members')
        .insert({
          session_id: session.id,
          name: name.trim(),
          color: MEMBER_COLORS[colorIndex],
          is_ready: false,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      const newMember: GroupMember = {
        id: member.id,
        name: member.name,
        color: member.color,
        isReady: false,
        joinedAt: new Date(member.joined_at),
      };

      // Save member identity to localStorage
      setStoredMember({
        memberId: member.id,
        sessionId: session.id,
        tableNumber,
      });

      setSessionId(session.id);
      setSessionCode(code);
      setCurrentUser(newMember);
      setMembers([newMember]);
      setIsJoined(true);

      return { session, member: newMember, code };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tableNumber]);

  const joinSession = useCallback(async (code: string, name: string) => {
    setIsLoading(true);
    try {
      // Find the session by code
      const { data: session, error: sessionError } = await supabase
        .from('dining_sessions')
        .select('*')
        .eq('session_code', code.toUpperCase())
        .eq('status', 'active')
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found or has ended');
      }

      // Get current member count for color assignment
      const { data: existingMembers } = await supabase
        .from('session_members')
        .select('*')
        .eq('session_id', session.id);

      const colorIndex = (existingMembers?.length || 0) % MEMBER_COLORS.length;

      // Add the new member
      const { data: member, error: memberError } = await supabase
        .from('session_members')
        .insert({
          session_id: session.id,
          name: name.trim(),
          color: MEMBER_COLORS[colorIndex],
          is_ready: false,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      const newMember: GroupMember = {
        id: member.id,
        name: member.name,
        color: member.color,
        isReady: false,
        joinedAt: new Date(member.joined_at),
      };

      // Fetch all data for this session
      const [membersResult, cartResult, ordersResult] = await Promise.all([
        supabase.from('session_members').select('*').eq('session_id', session.id).order('joined_at', { ascending: true }),
        supabase.from('cart_items').select('*, session_members(name)').eq('session_id', session.id),
        supabase.from('orders').select('*').eq('session_id', session.id).order('created_at', { ascending: true }),
      ]);

      // Save member identity to localStorage
      setStoredMember({
        memberId: member.id,
        sessionId: session.id,
        tableNumber: session.table_number,
      });

      setSessionId(session.id);
      setSessionCode(code.toUpperCase());
      setCurrentUser(newMember);
      
      if (membersResult.data) {
        setMembers(membersResult.data.map((m) => ({
          id: m.id,
          name: m.name,
          color: m.color,
          isReady: m.is_ready,
          joinedAt: new Date(m.joined_at),
        })));
      }

      if (cartResult.data) {
        setSharedCart(cartResult.data.map((item) => mapCartItem(item as DbCartItem & { session_members: { name: string } })));
      }

      if (ordersResult.data) {
        setSubmittedOrders(ordersResult.data.map((o) => mapOrder(o as unknown as DbOrder)));
      }

      setIsJoined(true);

      return { session, member: newMember };
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveSession = useCallback(async () => {
    if (!currentUser || !sessionId) return;

    try {
      // Delete member's cart items
      await supabase
        .from('cart_items')
        .delete()
        .eq('member_id', currentUser.id);

      // Remove member from session
      await supabase
        .from('session_members')
        .delete()
        .eq('id', currentUser.id);

      // Clear stored member identity
      setStoredMember(null);

      setSessionId(null);
      setSessionCode(null);
      setCurrentUser(null);
      setMembers([]);
      setSharedCart([]);
      setSubmittedOrders([]);
      setIsJoined(false);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }, [currentUser, sessionId]);

  const addItem = useCallback(async (menuItem: MenuItem) => {
    if (!currentUser || !sessionId) return;

    try {
      // Check if this item already exists for this user
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('session_id', sessionId)
        .eq('member_id', currentUser.id)
        .eq('menu_item_id', menuItem.id)
        .single();

      if (existing) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
      } else {
        // Insert new item
        await supabase
          .from('cart_items')
          .insert({
            session_id: sessionId,
            member_id: currentUser.id,
            menu_item_id: menuItem.id,
            menu_item_name: menuItem.name,
            menu_item_price: menuItem.price,
            menu_item_image: menuItem.image,
            menu_item_category: menuItem.category,
            quantity: 1,
          });
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }, [currentUser, sessionId]);

  const removeItem = useCallback(async (itemId: string, addedById: string) => {
    if (!currentUser || !sessionId) return;
    if (currentUser.id !== addedById) return;

    try {
      // Find the cart item by menu_item_id and member_id
      const { data: cartItem, error: findError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('session_id', sessionId)
        .eq('member_id', addedById)
        .eq('menu_item_id', itemId)
        .single();

      if (findError) {
        console.error('Error finding cart item:', findError);
        return;
      }

      if (cartItem) {
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItem.id);
        
        if (deleteError) {
          console.error('Error deleting cart item:', deleteError);
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }, [currentUser, sessionId]);

  const updateQuantity = useCallback(async (itemId: string, addedById: string, quantity: number) => {
    if (!currentUser || currentUser.id !== addedById) return;

    try {
      const { data: cartItem } = await supabase
        .from('cart_items')
        .select('id')
        .eq('session_id', sessionId)
        .eq('member_id', addedById)
        .eq('menu_item_id', itemId)
        .single();

      if (cartItem) {
        if (quantity <= 0) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItem.id);
        } else {
          await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', cartItem.id);
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [currentUser, sessionId]);

  const toggleReady = useCallback(async () => {
    if (!currentUser) return;

    const newReadyState = !currentUser.isReady;

    try {
      await supabase
        .from('session_members')
        .update({ is_ready: newReadyState })
        .eq('id', currentUser.id);

      setCurrentUser((prev) => prev ? { ...prev, isReady: newReadyState } : null);
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  }, [currentUser]);

  const submitMyOrder = useCallback(async () => {
    if (!currentUser || !sessionId) return;

    const myItems = sharedCart.filter((item) => item.addedById === currentUser.id);
    if (myItems.length === 0) return;

    try {
      const totalAmount = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          session_id: sessionId,
          submitted_by_id: currentUser.id,
          submitted_by_name: currentUser.name,
          status: 'received',
          total_amount: totalAmount,
          items: myItems as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;

      // Remove submitted items from cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId)
        .eq('member_id', currentUser.id);

      // Mark user as ready
      await supabase
        .from('session_members')
        .update({ is_ready: true })
        .eq('id', currentUser.id);

      setCurrentUser((prev) => prev ? { ...prev, isReady: true } : null);

      return order;
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  }, [currentUser, sessionId, sharedCart]);

  const submitGroupOrder = useCallback(async () => {
    if (!currentUser || !sessionId || sharedCart.length === 0) return;

    try {
      const totalAmount = sharedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          session_id: sessionId,
          submitted_by_id: null,
          submitted_by_name: 'Group',
          status: 'received',
          total_amount: totalAmount,
          items: sharedCart as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear the cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      // Mark everyone as ready
      await supabase
        .from('session_members')
        .update({ is_ready: true })
        .eq('session_id', sessionId);

      setCurrentUser((prev) => prev ? { ...prev, isReady: true } : null);

      return order;
    } catch (error) {
      console.error('Error submitting group order:', error);
    }
  }, [currentUser, sessionId, sharedCart]);

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

  const openPayment = useCallback(() => {
    setIsPaymentOpen(true);
  }, []);

  const closePayment = useCallback(() => {
    setIsPaymentOpen(false);
  }, []);

  const completeSession = useCallback(() => {
    setSessionComplete(true);
    setIsPaymentOpen(false);
  }, []);

  const endSession = useCallback(async () => {
    if (sessionId) {
      try {
        await supabase
          .from('dining_sessions')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    // Clear stored member identity
    setStoredMember(null);

    setSessionId(null);
    setSessionCode(null);
    setCurrentUser(null);
    setMembers([]);
    setSharedCart([]);
    setSubmittedOrders([]);
    setIsJoined(false);
    setIsPaymentOpen(false);
    setSessionComplete(true);
  }, [sessionId]);

  // Calculate total from submitted orders
  const submittedTotal = useMemo(() => {
    return submittedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [submittedOrders]);

  return {
    sessionId,
    sessionCode,
    currentUser,
    members,
    sharedCart,
    submittedOrders,
    isJoined,
    isPaymentOpen,
    sessionComplete,
    isLoading,
    checkingSession,
    existingSession,
    myItems,
    myTotal,
    groupTotal,
    totalItems,
    readyMembers,
    allReady,
    itemsByPerson,
    submittedTotal,
    createSession,
    joinSession,
    joinExistingSession,
    leaveSession,
    addItem,
    removeItem,
    updateQuantity,
    toggleReady,
    submitMyOrder,
    submitGroupOrder,
    openPayment,
    closePayment,
    completeSession,
    endSession,
  };
}
