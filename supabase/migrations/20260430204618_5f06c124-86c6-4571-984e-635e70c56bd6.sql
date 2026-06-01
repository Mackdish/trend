CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slide_key TEXT NOT NULL UNIQUE,
  tag TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Shop Now',
  cta_link TEXT NOT NULL DEFAULT '/catalog',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero slides are publicly readable"
ON public.hero_slides FOR SELECT USING (true);

CREATE POLICY "Admins can manage hero slides"
ON public.hero_slides FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hero_slides (slide_key, tag, title, subtitle, cta_text, cta_link, sort_order) VALUES
('hot-deals', '🔥 Hot Deals', 'Buy Sneakers Online in Kenya', 'Up to 50% off on authentic Nike, Adidas & Puma shoes. Free delivery in Nairobi.', 'Shop Now', '/catalog', 1),
('new-arrivals', '🆕 New Arrivals', 'Fresh Kicks Just Landed', 'Discover the latest styles from top brands. Be the first to rock new trends.', 'Explore New', '/catalog?filter=new', 2),
('flash-sale', '⚡ Flash Sale', 'Limited Time Offers', 'Grab unbeatable deals before they''re gone. Up to 40% off select styles.', 'View Deals', '/catalog?filter=deals', 3);