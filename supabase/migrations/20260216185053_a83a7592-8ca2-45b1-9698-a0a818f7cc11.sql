
-- Create dine-in menu items table
CREATE TABLE public.dine_in_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  category text NOT NULL,
  image_url text,
  allergens text[] DEFAULT '{}',
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dine_in_menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read menu
CREATE POLICY "menu_items_public_read" ON public.dine_in_menu_items
  FOR SELECT USING (true);

-- Staff can manage menu items
CREATE POLICY "staff_insert_menu" ON public.dine_in_menu_items
  FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "staff_update_menu" ON public.dine_in_menu_items
  FOR UPDATE TO authenticated USING (is_staff(auth.uid()));

CREATE POLICY "staff_delete_menu" ON public.dine_in_menu_items
  FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- Create service alerts table
CREATE TABLE public.service_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.dining_sessions(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  type text NOT NULL CHECK (type IN ('waiter', 'bill', 'assistance')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed')),
  assigned_to uuid,
  guest_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.service_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can create alerts (guests)
CREATE POLICY "alerts_insert" ON public.service_alerts
  FOR INSERT WITH CHECK (true);

-- Anyone can read alerts
CREATE POLICY "alerts_select" ON public.service_alerts
  FOR SELECT USING (true);

-- Staff can update alerts
CREATE POLICY "staff_update_alerts" ON public.service_alerts
  FOR UPDATE TO authenticated USING (is_staff(auth.uid()));

-- Staff can delete alerts
CREATE POLICY "staff_delete_alerts" ON public.service_alerts
  FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- Enable realtime for service alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dine_in_menu_items;

-- Add RLS policies for staff to manage restaurants
CREATE POLICY "staff_update_restaurants" ON public.restaurants
  FOR UPDATE TO authenticated USING (is_staff(auth.uid()));

-- Updated at trigger for menu items
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_dine_in_menu_items_updated_at
  BEFORE UPDATE ON public.dine_in_menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
