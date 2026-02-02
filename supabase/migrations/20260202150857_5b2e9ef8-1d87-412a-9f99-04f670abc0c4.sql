-- Enable REPLICA IDENTITY FULL on cart_items table so DELETE events include session_id
-- This is needed for realtime subscriptions to properly filter DELETE events by session
ALTER TABLE public.cart_items REPLICA IDENTITY FULL;

-- Also enable for other tables that might need it
ALTER TABLE public.session_members REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;