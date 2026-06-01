import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProduct } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import { mapToCardProduct } from '@/components/home/FlashDeals';
import { Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DbProduct } from '@/hooks/useProducts';

function useAIRecommendations(searchQuery: string) {
  return useQuery({
    queryKey: ['ai-recommendations', searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { searchQuery, limit: 6 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { recommendedIds: string[]; query: string };
    },
    enabled: !!searchQuery && searchQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['products-by-ids', ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase.from('products').select('*').in('id', ids);
      if (error) throw error;
      // Preserve the order from AI recommendations
      const map = new Map((data || []).map(p => [p.id, p]));
      return ids.map(id => map.get(id)).filter(Boolean).map(row => ({
        ...row,
        price: Number(row!.price),
        original_price: row!.original_price ? Number(row!.original_price) : null,
        colors: Array.isArray(row!.colors) ? row!.colors : [],
        sizes: Array.isArray(row!.sizes) ? row!.sizes : [],
        images: Array.isArray(row!.images) ? row!.images : [],
      })) as unknown as DbProduct[];
    },
    enabled: ids.length > 0,
  });
}

export default function AIRecommendations({ searchQuery }: { searchQuery: string }) {
  const { data: aiData, isLoading: aiLoading, error: aiError } = useAIRecommendations(searchQuery);
  const { data: products, isLoading: productsLoading } = useProductsByIds(aiData?.recommendedIds || []);

  if (!searchQuery || searchQuery.trim().length < 2) return null;
  if (aiError) return null; // Silently fail

  const isLoading = aiLoading || productsLoading;

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-lg font-bold text-foreground">AI Recommendations</h2>
          <span className="text-xs text-muted-foreground">Finding the best matches...</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-lg border animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">AI Picks for "{searchQuery}"</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={mapToCardProduct(product)} index={i} />
        ))}
      </div>
    </section>
  );
}
