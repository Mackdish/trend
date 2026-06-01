import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category_id: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  discount: number | null;
  sizes: number[];
  colors: { name: string; hex: string }[];
  images: string[];
  rating: number | null;
  reviews_count: number | null;
  sold_count: number | null;
  in_stock: boolean | null;
  stock_quantity: number | null;
  is_new: boolean | null;
  is_flash_deal: boolean | null;
  is_featured: boolean | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

function mapProduct(row: any): DbProduct {
  return {
    ...row,
    price: Number(row.price),
    original_price: row.original_price ? Number(row.original_price) : null,
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    images: Array.isArray(row.images) ? row.images : [],
  };
}

export function useProducts(filters?: {
  gender?: string;
  brand?: string;
  isFlashDeal?: boolean;
  isFeatured?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase.from('products').select('*');

      if (filters?.gender) query = query.eq('gender', filters.gender);
      if (filters?.brand) query = query.eq('brand', filters.brand);
      if (filters?.isFlashDeal) query = query.eq('is_flash_deal', true);
      if (filters?.isFeatured) query = query.eq('is_featured', true);
      if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);

      const { data, error } = await query.order('sold_count', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapProduct);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      return mapProduct(data);
    },
    enabled: !!id,
  });
}

export function useFlashDeals() {
  return useProducts({ isFlashDeal: true });
}

export function useFeaturedProducts() {
  return useProducts({ isFeatured: true });
}
