-- Create a function to clear all cart items for a session
-- This is needed for group order submission where all items need to be cleared
CREATE OR REPLACE FUNCTION public.clear_session_cart(target_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.cart_items
  WHERE session_id = target_session_id;
END;
$$;