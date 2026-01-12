-- Create table for dining sessions (each table's group session)
CREATE TABLE public.dining_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL,
  session_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for session members
CREATE TABLE public.session_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.dining_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for shared cart items
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.dining_sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.session_members(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL,
  menu_item_name TEXT NOT NULL,
  menu_item_price INTEGER NOT NULL,
  menu_item_image TEXT,
  menu_item_category TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for submitted orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.dining_sessions(id) ON DELETE CASCADE,
  submitted_by_id UUID REFERENCES public.session_members(id),
  submitted_by_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'served')),
  total_amount INTEGER NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.dining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for dining_sessions (public access for restaurant kiosk usage)
CREATE POLICY "Anyone can view active sessions" ON public.dining_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON public.dining_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.dining_sessions FOR UPDATE USING (true);

-- RLS policies for session_members (public access)
CREATE POLICY "Anyone can view session members" ON public.session_members FOR SELECT USING (true);
CREATE POLICY "Anyone can join sessions" ON public.session_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update members" ON public.session_members FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave sessions" ON public.session_members FOR DELETE USING (true);

-- RLS policies for cart_items (public access)
CREATE POLICY "Anyone can view cart items" ON public.cart_items FOR SELECT USING (true);
CREATE POLICY "Anyone can add cart items" ON public.cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cart items" ON public.cart_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can remove cart items" ON public.cart_items FOR DELETE USING (true);

-- RLS policies for orders (public access)
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.dining_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;