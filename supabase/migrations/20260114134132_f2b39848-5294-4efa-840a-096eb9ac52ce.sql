-- Set REPLICA IDENTITY FULL on cart_items and orders tables
-- This ensures DELETE events include the session_id needed for filtering
ALTER TABLE public.cart_items REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.dining_sessions REPLICA IDENTITY FULL;