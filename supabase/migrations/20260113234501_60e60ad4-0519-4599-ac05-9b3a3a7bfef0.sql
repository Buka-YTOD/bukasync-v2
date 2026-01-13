-- Add device_token column to session_members for unique device identification
ALTER TABLE public.session_members 
ADD COLUMN IF NOT EXISTS device_token text;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_members_device_token 
ON public.session_members(device_token);

-- Create a function to check if a device token is a member of a session
CREATE OR REPLACE FUNCTION public.is_session_member(check_session_id uuid, check_device_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.session_members
    WHERE session_id = check_session_id
      AND device_token = check_device_token
  )
$$;

-- Create a function to get member_id from device token and session
CREATE OR REPLACE FUNCTION public.get_member_id_by_device(check_session_id uuid, check_device_token text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.session_members
  WHERE session_id = check_session_id
    AND device_token = check_device_token
  LIMIT 1
$$;

-- Drop existing permissive policies on cart_items
DROP POLICY IF EXISTS "Anyone can add cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can remove cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can update cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can view cart items" ON public.cart_items;

-- Create new session-scoped RLS policies for cart_items
-- Users can only view cart items in sessions they belong to
CREATE POLICY "Session members can view cart items"
ON public.cart_items
FOR SELECT
USING (
  public.is_session_member(
    session_id, 
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);

-- Users can only add cart items to sessions they belong to
CREATE POLICY "Session members can add cart items"
ON public.cart_items
FOR INSERT
WITH CHECK (
  public.is_session_member(
    session_id, 
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);

-- Users can only update their own cart items
CREATE POLICY "Members can update own cart items"
ON public.cart_items
FOR UPDATE
USING (
  member_id = public.get_member_id_by_device(
    session_id,
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);

-- Users can only delete their own cart items
CREATE POLICY "Members can delete own cart items"
ON public.cart_items
FOR DELETE
USING (
  member_id = public.get_member_id_by_device(
    session_id,
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);

-- Drop existing permissive policies on session_members
DROP POLICY IF EXISTS "Anyone can view session members" ON public.session_members;
DROP POLICY IF EXISTS "Anyone can join sessions" ON public.session_members;
DROP POLICY IF EXISTS "Anyone can update members" ON public.session_members;
DROP POLICY IF EXISTS "Anyone can leave sessions" ON public.session_members;

-- Create new session-scoped RLS policies for session_members
-- Allow viewing members only for sessions user belongs to
CREATE POLICY "Session members can view other members"
ON public.session_members
FOR SELECT
USING (
  public.is_session_member(
    session_id, 
    current_setting('request.headers', true)::json->>'x-device-token'
  )
  OR 
  -- Allow initial lookup of any session to enable joining
  device_token IS NULL
);

-- Allow anyone to join a session (insert new member)
CREATE POLICY "Anyone can join a session"
ON public.session_members
FOR INSERT
WITH CHECK (true);

-- Members can only update their own record
CREATE POLICY "Members can update own record"
ON public.session_members
FOR UPDATE
USING (
  device_token = current_setting('request.headers', true)::json->>'x-device-token'
);

-- Members can only leave (delete) their own record
CREATE POLICY "Members can leave own session"
ON public.session_members
FOR DELETE
USING (
  device_token = current_setting('request.headers', true)::json->>'x-device-token'
);

-- Drop existing permissive policies on orders
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;

-- Create session-scoped policies for orders
CREATE POLICY "Session members can view orders"
ON public.orders
FOR SELECT
USING (
  public.is_session_member(
    session_id, 
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);

CREATE POLICY "Session members can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  public.is_session_member(
    session_id, 
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);

-- Allow updating orders for restaurant staff (can be refined later)
CREATE POLICY "Session members can update orders"
ON public.orders
FOR UPDATE
USING (
  public.is_session_member(
    session_id, 
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);

-- Drop existing policies on dining_sessions (keep them more open since sessions need discovery)
DROP POLICY IF EXISTS "Anyone can view active sessions" ON public.dining_sessions;
DROP POLICY IF EXISTS "Anyone can create sessions" ON public.dining_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.dining_sessions;

-- Allow viewing sessions (needed for joining)
CREATE POLICY "Anyone can view sessions"
ON public.dining_sessions
FOR SELECT
USING (true);

-- Allow creating sessions
CREATE POLICY "Anyone can create sessions"
ON public.dining_sessions
FOR INSERT
WITH CHECK (true);

-- Only session members can update sessions
CREATE POLICY "Session members can update sessions"
ON public.dining_sessions
FOR UPDATE
USING (
  public.is_session_member(
    id, 
    current_setting('request.headers', true)::json->>'x-device-token'
  )
);