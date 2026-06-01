-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id),
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  discount INTEGER DEFAULT 0,
  sizes INTEGER[] DEFAULT '{}',
  colors JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_flash_deal BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total NUMERIC(10,2) NOT NULL,
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  size INTEGER,
  color TEXT,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
CREATE POLICY "Users can create own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Wishlist table
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Product reviews table
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON public.product_reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.product_reviews
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_gender ON public.products(gender);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_is_flash_deal ON public.products(is_flash_deal) WHERE is_flash_deal = true;
CREATE INDEX idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);

-- Seed categories
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Men', 'men', '👟', 1),
  ('Women', 'women', '👠', 2),
  ('Kids', 'kids', '🧒', 3);

-- Seed products
INSERT INTO public.products (name, slug, brand, gender, price, original_price, discount, rating, reviews_count, sizes, colors, images, description, in_stock, stock_quantity, is_new, is_flash_deal, is_featured, sold_count) VALUES
  ('Air Max Pulse', 'air-max-pulse', 'Nike', 'men', 8999, 14999, 40, 4.5, 234, '{39,40,41,42,43,44,45}', '[{"name":"Black","hex":"#1a1a1a"},{"name":"White","hex":"#ffffff"},{"name":"Red","hex":"#e53e3e"}]', '{}', 'The Nike Air Max Pulse draws inspiration from the iconic Air Max line with a bold, futuristic design.', true, 50, true, true, true, 1203),
  ('Ultraboost Light', 'ultraboost-light', 'Adidas', 'men', 12499, 18999, 34, 4.7, 189, '{40,41,42,43,44}', '[{"name":"Core Black","hex":"#000000"},{"name":"Cloud White","hex":"#f5f5f5"}]', '{}', 'Experience incredible energy return with the Ultraboost Light running shoes.', true, 30, false, true, true, 879),
  ('Classic Leather', 'classic-leather', 'Reebok', 'women', 5999, 8499, 29, 4.3, 156, '{36,37,38,39,40,41}', '[{"name":"White","hex":"#ffffff"},{"name":"Pink","hex":"#ed64a6"}]', '{}', 'A timeless silhouette that pairs effortlessly with any outfit.', true, 40, false, false, true, 567),
  ('RS-X Reinvention', 'rs-x-reinvention', 'Puma', 'men', 7499, 11999, 37, 4.4, 98, '{40,41,42,43,44,45}', '[{"name":"Blue/Red","hex":"#3182ce"},{"name":"Black/White","hex":"#1a1a1a"}]', '{}', 'Bold chunky sneakers inspired by 80s running culture.', true, 25, true, false, true, 432),
  ('Old Skool', 'old-skool', 'Vans', 'women', 4999, 7499, 33, 4.6, 312, '{36,37,38,39,40,41,42}', '[{"name":"Black/White","hex":"#1a1a1a"},{"name":"Navy","hex":"#2b6cb0"}]', '{}', 'The iconic Vans Old Skool with the legendary side stripe.', true, 60, false, false, true, 1567),
  ('Chuck Taylor All Star', 'chuck-taylor', 'Converse', 'kids', 3499, 4999, 30, 4.8, 445, '{28,29,30,31,32,33,34,35}', '[{"name":"Red","hex":"#e53e3e"},{"name":"Blue","hex":"#3182ce"},{"name":"White","hex":"#ffffff"}]', '{}', 'A classic sneaker for kids that never goes out of style.', true, 80, false, true, true, 2100),
  ('Gel-Kayano 30', 'gel-kayano-30', 'Asics', 'men', 15999, 21999, 27, 4.9, 76, '{41,42,43,44,45}', '[{"name":"Black/Yellow","hex":"#1a1a1a"}]', '{}', 'Premium stability running shoe with advanced cushioning technology.', true, 15, false, false, false, 234),
  ('Air Jordan 1 Mid', 'air-jordan-1-mid', 'Nike', 'women', 11999, 16499, 27, 4.7, 523, '{36,37,38,39,40}', '[{"name":"White/Pink","hex":"#ed64a6"},{"name":"Black/Gold","hex":"#1a1a1a"}]', '{}', 'The legendary Air Jordan 1 Mid in stunning colorways.', true, 35, true, false, true, 1890),
  ('Superstar', 'superstar', 'Adidas', 'kids', 2999, 4499, 33, 4.5, 267, '{28,29,30,31,32,33,34}', '[{"name":"White/Black","hex":"#ffffff"},{"name":"White/Green","hex":"#38a169"}]', '{}', 'The iconic shell toe design in kid-friendly sizes.', true, 70, false, false, true, 890),
  ('Suede Classic XXI', 'suede-classic', 'Puma', 'women', 6499, 9499, 32, 4.4, 145, '{36,37,38,39,40,41}', '[{"name":"Marshmallow","hex":"#f7e6d5"},{"name":"Dusty Pink","hex":"#d4a0a0"}]', '{}', 'Premium suede upper with a relaxed, everyday vibe.', true, 45, false, false, false, 678),
  ('Fresh Foam X 1080v13', 'fresh-foam-1080', 'New Balance', 'men', 13999, 19999, 30, 4.8, 88, '{41,42,43,44,45,46}', '[{"name":"Grey/Neon","hex":"#718096"}]', '{}', 'Plush cushioning meets responsive performance for long runs.', true, 20, false, true, false, 345),
  ('Forum Low', 'forum-low', 'Adidas', 'kids', 3999, 5999, 33, 4.6, 192, '{30,31,32,33,34,35}', '[{"name":"Cloud White","hex":"#f5f5f5"},{"name":"Blue Rush","hex":"#4299e1"}]', '{}', 'Retro basketball-inspired style sized down for little feet.', true, 55, true, false, false, 410);