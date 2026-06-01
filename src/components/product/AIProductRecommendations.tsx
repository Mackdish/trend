import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/product/ProductCard';
import { mapToCardProduct } from '@/components/home/FlashDeals';
import { Sparkles } from 'lucide-react';
import type { DbProduct } from '@/hooks/useProducts';

function useAIProductRecs(productName: string, productBrand: string, productGender: string | null) {
  const searchQuery = `${productBrand} ${productName} ${productGender || ''}`.trim();
  return useQuery({
    queryKey: ['ai-product-recs', searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { searchQuery, limit: 4 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { recommendedIds: string[] };
    },
    enabled: !!productName,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

function useProductsByIds(ids: string[], excludeId: string) {
  const filtered = ids.filter(id => id !== excludeId);
  return useQuery({
    queryKey: ['products-by-ids', filtered],
    queryFn: async () => {
      if (!filtered.length) return [];
      const { data, error } = await supabase.from('products').select('*').in('id', filtered);
      if (error) throw error;
      const map = new Map((data || []).map(p => [p.id, p]));
      return filtered.map(id => map.get(id)).filter(Boolean).map(row => ({
        ...row,
        price: Number(row!.price),
        original_price: row!.original_price ? Number(row!.original_price) : null,
        colors: Array.isArray(row!.colors) ? row!.colors : [],
        sizes: Array.isArray(row!.sizes) ? row!.sizes : [],
        images: Array.isArray(row!.images) ? row!.images : [],
      })) as unknown as DbProduct[];
    },
    enabled: filtered.length > 0,
  });
}

export default function AIProductRecommendations({ productId, productName, productBrand, productGender }: {
  productId: string;
  productName: string;
  productBrand: string;
  productGender: string | null;
}) {
  const { data: aiData, isLoading: aiLoading } = useAIProductRecs(productName, productBrand, productGender);
  const { data: products, isLoading: productsLoading } = useProductsByIds(aiData?.recommendedIds || [], productId);

  const isLoading = aiLoading || productsLoading;

  if (isLoading) {
    return (
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-xl font-bold text-foreground">Customers Also Viewed</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-lg border animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Customers Also Viewed</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={mapToCardProduct(product)} index={i} />
        ))}
      </div>
    </section>
  );
}
