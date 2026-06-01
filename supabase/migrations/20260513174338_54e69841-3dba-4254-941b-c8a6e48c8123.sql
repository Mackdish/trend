
-- Remove broad public SELECT (listing) on storage.objects for product-images.
-- Direct CDN URLs continue to work for public buckets.
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;

-- Lock down SECURITY DEFINER helpers so they cannot be executed via PostgREST.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_order_insert_defaults() FROM anon, authenticated, public;
