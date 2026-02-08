
-- Restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  open_time TIME NOT NULL DEFAULT '08:00',
  close_time TIME NOT NULL DEFAULT '22:00',
  open_days TEXT[] NOT NULL DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
  supports_dinein BOOLEAN NOT NULL DEFAULT true,
  supports_shop BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 4.5,
  delivery_fee INTEGER DEFAULT 500,
  estimated_delivery_mins INTEGER DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurants_public_read" ON public.restaurants FOR SELECT USING (true);

-- Shop menu items
CREATE TABLE public.shop_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_menu_public_read" ON public.shop_menu_items FOR SELECT USING (true);

-- Shop orders
CREATE TABLE public.shop_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT,
  fulfillment_type TEXT NOT NULL DEFAULT 'delivery',
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_orders_insert" ON public.shop_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "shop_orders_select" ON public.shop_orders FOR SELECT USING (true);

-- Seed mock restaurants
INSERT INTO public.restaurants (name, description, address, phone, open_time, close_time, open_days, rating, delivery_fee, estimated_delivery_mins, image_url) VALUES
('Mama Put Kitchen', 'Authentic Nigerian home-cooked meals made with love', '15 Allen Avenue, Ikeja, Lagos', '08012345678', '07:00', '22:00', ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], 4.7, 500, 25, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'),
('Iya Basira Amala Spot', 'The best amala and gbegiri in town since 1985', '42 Bode Thomas Street, Surulere, Lagos', '08098765432', '08:00', '21:00', ARRAY['monday','tuesday','wednesday','thursday','friday','saturday'], 4.8, 600, 30, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600'),
('Suya Republic', 'Premium suya and grills for every occasion', '8 Admiralty Way, Lekki, Lagos', '08055544433', '12:00', '23:59', ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], 4.5, 800, 35, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600'),
('Jollof & Co', 'Modern Nigerian cuisine with a twist', '3 Isaac John Street, GRA, Ikeja', '08033322211', '09:00', '22:00', ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], 4.6, 700, 30, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600'),
('The Plantain Factory', 'Everything plantain - fried, roasted, boiled, and more', '22 Opebi Road, Ikeja, Lagos', '08011100099', '08:00', '20:00', ARRAY['tuesday','wednesday','thursday','friday','saturday','sunday'], 4.4, 400, 20, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600');

-- Seed menu items for each restaurant
-- Mama Put Kitchen
INSERT INTO public.shop_menu_items (restaurant_id, name, description, price, category, image_url) 
SELECT r.id, items.name, items.description, items.price, items.category, items.image_url
FROM public.restaurants r,
(VALUES 
  ('Jollof Rice & Chicken', 'Smoky party-style jollof with grilled chicken', 3500, 'Rice', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Fried Rice & Turkey', 'Vegetable fried rice with seasoned turkey', 4000, 'Rice', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'),
  ('Egusi Soup & Pounded Yam', 'Rich melon seed soup with smooth pounded yam', 3000, 'Soups', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Pepper Soup (Goat)', 'Spicy goat meat pepper soup', 4500, 'Soups', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400'),
  ('Moi Moi', 'Steamed bean pudding with eggs', 800, 'Sides', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'),
  ('Chapman', 'Classic Nigerian cocktail drink', 1500, 'Drinks', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400')
) AS items(name, description, price, category, image_url)
WHERE r.name = 'Mama Put Kitchen';

-- Iya Basira
INSERT INTO public.shop_menu_items (restaurant_id, name, description, price, category, image_url)
SELECT r.id, items.name, items.description, items.price, items.category, items.image_url
FROM public.restaurants r,
(VALUES
  ('Amala & Gbegiri/Ewedu', 'Signature amala with dual soup combo', 2500, 'Swallow', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Amala & Ofada Stew', 'Amala with spicy ofada sauce', 3000, 'Swallow', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Eba & Ogbono Soup', 'Garri swallow with draw soup and assorted meat', 2800, 'Swallow', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Assorted Meat', 'Mixed protein platter - cow leg, shaki, ponmo', 2000, 'Sides', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
  ('Zobo Drink', 'Chilled hibiscus drink with pineapple', 500, 'Drinks', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400')
) AS items(name, description, price, category, image_url)
WHERE r.name = 'Iya Basira Amala Spot';

-- Suya Republic
INSERT INTO public.shop_menu_items (restaurant_id, name, description, price, category, image_url)
SELECT r.id, items.name, items.description, items.price, items.category, items.image_url
FROM public.restaurants r,
(VALUES
  ('Beef Suya (Full)', 'Spicy grilled beef skewers - full portion', 5000, 'Suya', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
  ('Chicken Suya', 'Grilled spicy chicken suya', 4500, 'Suya', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
  ('Ram Suya', 'Premium ram suya special', 6000, 'Suya', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
  ('Kidney Suya', 'Grilled kidney with yaji spice', 3500, 'Suya', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
  ('Suya Jollof Combo', 'Jollof rice with mixed suya platter', 7000, 'Combos', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Chilled Kunu', 'Traditional millet drink, ice cold', 800, 'Drinks', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400')
) AS items(name, description, price, category, image_url)
WHERE r.name = 'Suya Republic';

-- Jollof & Co
INSERT INTO public.shop_menu_items (restaurant_id, name, description, price, category, image_url)
SELECT r.id, items.name, items.description, items.price, items.category, items.image_url
FROM public.restaurants r,
(VALUES
  ('Signature Jollof', 'Award-winning smoky jollof rice', 3500, 'Mains', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Coconut Jollof', 'Creamy coconut-infused jollof', 4000, 'Mains', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400'),
  ('Asun', 'Spicy grilled goat meat', 5000, 'Small Chops', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
  ('Puff Puff', 'Sweet fried dough balls', 1000, 'Small Chops', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'),
  ('Grilled Fish', 'Whole tilapia with pepper sauce', 5500, 'Mains', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'),
  ('Fresh Juice Blend', 'Pineapple, ginger & cucumber', 1200, 'Drinks', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400')
) AS items(name, description, price, category, image_url)
WHERE r.name = 'Jollof & Co';

-- The Plantain Factory
INSERT INTO public.shop_menu_items (restaurant_id, name, description, price, category, image_url)
SELECT r.id, items.name, items.description, items.price, items.category, items.image_url
FROM public.restaurants r,
(VALUES
  ('Dodo & Beans', 'Fried plantain with stewed beans', 2000, 'Classics', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'),
  ('Bole & Fish', 'Roasted plantain with grilled fish and pepper sauce', 3500, 'Classics', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'),
  ('Plantain Chips', 'Crispy sweet or salted plantain chips', 1500, 'Snacks', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'),
  ('Kelewele', 'Spicy fried ripe plantain cubes', 1800, 'Snacks', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'),
  ('Plantain Porridge', 'Savory plantain porridge with vegetables', 2500, 'Specials', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'),
  ('Palm Wine', 'Fresh palm wine, chilled', 1000, 'Drinks', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400')
) AS items(name, description, price, category, image_url)
WHERE r.name = 'The Plantain Factory';
