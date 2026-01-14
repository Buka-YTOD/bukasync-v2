-- Drop ALL existing policies on all tables first
DROP POLICY IF EXISTS "Members can delete own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Members can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Session members can add cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Session members can view cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can view cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can add cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can update cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can delete cart items" ON public.cart_items;

DROP POLICY IF EXISTS "Anyone can join a session" ON public.session_members;
DROP POLICY IF EXISTS "Members can leave own session" ON public.session_members;
DROP POLICY IF EXISTS "Members can update own record" ON public.session_members;
DROP POLICY IF EXISTS "Session members can view other members" ON public.session_members;
DROP POLICY IF EXISTS "Anyone can view members" ON public.session_members;
DROP POLICY IF EXISTS "Anyone can join" ON public.session_members;
DROP POLICY IF EXISTS "Anyone can update members" ON public.session_members;
DROP POLICY IF EXISTS "Anyone can leave" ON public.session_members;

DROP POLICY IF EXISTS "Anyone can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Session members can create orders" ON public.orders;
DROP POLICY IF EXISTS "Session members can update orders" ON public.orders;
DROP POLICY IF EXISTS "Session members can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

DROP POLICY IF EXISTS "Anyone can create sessions" ON public.dining_sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.dining_sessions;
DROP POLICY IF EXISTS "Session members can update sessions" ON public.dining_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.dining_sessions;

-- Create simple permissive policies for MVP

-- Cart items: fully open
CREATE POLICY "cart_select" ON public.cart_items FOR SELECT USING (true);
CREATE POLICY "cart_insert" ON public.cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "cart_update" ON public.cart_items FOR UPDATE USING (true);
CREATE POLICY "cart_delete" ON public.cart_items FOR DELETE USING (true);

-- Session members: fully open
CREATE POLICY "members_select" ON public.session_members FOR SELECT USING (true);
CREATE POLICY "members_insert" ON public.session_members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_update" ON public.session_members FOR UPDATE USING (true);
CREATE POLICY "members_delete" ON public.session_members FOR DELETE USING (true);

-- Orders: fully open
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE USING (true);

-- Dining sessions: fully open
CREATE POLICY "sessions_select" ON public.dining_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert" ON public.dining_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_update" ON public.dining_sessions FOR UPDATE USING (true);