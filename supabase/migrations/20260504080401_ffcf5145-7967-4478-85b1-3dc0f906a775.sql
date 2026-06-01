-- 1) product_reviews: restrict SELECT to authenticated; add public view without user_id
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.product_reviews;

CREATE POLICY "Authenticated users can read reviews"
ON public.product_reviews
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE VIEW public.public_product_reviews
WITH (security_invoker = true) AS
SELECT id, product_id, rating, comment, created_at
FROM public.product_reviews;

GRANT SELECT ON public.public_product_reviews TO anon, authenticated;

-- 2) orders: prevent users from setting privileged fields on insert
CREATE OR REPLACE FUNCTION public.enforce_order_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Only enforce for non-admin callers
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.payment_status := 'pending';
    NEW.status := 'pending';
    NEW.tracking_number := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_order_insert_defaults_trg ON public.orders;
CREATE TRIGGER enforce_order_insert_defaults_trg
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_order_insert_defaults();

-- 3) Realtime: scope channel subscriptions for orders to the owner
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own order channel" ON realtime.messages;
CREATE POLICY "Users can subscribe to own order channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = realtime.topic()
      AND o.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 4) Lock down has_role execute privileges (RLS still uses it as table owner)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;