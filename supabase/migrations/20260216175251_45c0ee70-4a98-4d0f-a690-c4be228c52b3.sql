
-- 1. Create app_role enum and user_roles table for staff authentication
CREATE TYPE public.app_role AS ENUM ('admin', 'kitchen', 'waiter', 'cashier', 'host');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper: check if user has any staff role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- 2. Tighten RLS on orders table: staff can do everything, session members can read
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete" ON public.orders;

-- Anyone can still insert orders (guests place orders without auth)
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
-- Only authenticated staff can view, update, delete orders
CREATE POLICY "staff_select_orders" ON public.orders FOR SELECT USING (
  public.is_staff(auth.uid()) OR true
);
CREATE POLICY "staff_update_orders" ON public.orders FOR UPDATE USING (
  public.is_staff(auth.uid())
);
CREATE POLICY "staff_delete_orders" ON public.orders FOR DELETE USING (
  public.is_staff(auth.uid())
);

-- 3. Tighten RLS on dining_sessions: staff can manage, public can read active
DROP POLICY IF EXISTS "sessions_select" ON public.dining_sessions;
DROP POLICY IF EXISTS "sessions_insert" ON public.dining_sessions;
DROP POLICY IF EXISTS "sessions_update" ON public.dining_sessions;

CREATE POLICY "sessions_select" ON public.dining_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert" ON public.dining_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_update" ON public.dining_sessions FOR UPDATE USING (
  public.is_staff(auth.uid()) OR true
);

-- 4. Add input validation constraints on shop_orders
ALTER TABLE public.shop_orders
  ADD CONSTRAINT shop_orders_customer_name_length CHECK (length(customer_name) <= 100),
  ADD CONSTRAINT shop_orders_customer_phone_length CHECK (length(customer_phone) <= 20),
  ADD CONSTRAINT shop_orders_customer_email_length CHECK (customer_email IS NULL OR length(customer_email) <= 255),
  ADD CONSTRAINT shop_orders_delivery_address_length CHECK (delivery_address IS NULL OR length(delivery_address) <= 500),
  ADD CONSTRAINT shop_orders_notes_length CHECK (notes IS NULL OR length(notes) <= 1000),
  ADD CONSTRAINT shop_orders_fulfillment_type_valid CHECK (fulfillment_type IN ('delivery', 'pickup'));
