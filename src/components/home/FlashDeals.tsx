import { useFlashDeals } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import { Timer } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DbProduct } from '@/hooks/useProducts';

function mapToCardProduct(p: DbProduct) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: (p.gender || 'men') as 'men' | 'women' | 'kids',
    subcategory: '',
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    discount: p.discount ?? undefined,
    rating: p.rating ?? 0,
    reviews: p.reviews_count ?? 0,
    images: p.images.length ? p.images : ['/placeholder.svg'],
    sizes: p.sizes,
    colors: p.colors,
    description: p.description ?? '',
    inStock: p.in_stock ?? true,
    isNew: p.is_new ?? false,
    isFlashDeal: p.is_flash_deal ?? false,
    soldCount: p.sold_count ?? 0,
  };
}

export { mapToCardProduct };

export default function FlashDeals() {
  const { data: flashProducts, isLoading } = useFlashDeals();
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 23, seconds: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <section className="px-4 mt-8">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">⚡ Flash Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-lg border animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  if (!flashProducts?.length) return null;

  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">⚡ Flash Deals</h2>
          <div className="flex items-center gap-1.5 bg-nav text-nav-foreground px-3 py-1.5 rounded-full text-xs font-bold">
            <Timer className="h-3.5 w-3.5" />
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
        <a href="/catalog?deals=true" className="text-sm font-medium text-primary hover:underline">
          See All →
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {flashProducts.map((product, i) => (
          <ProductCard key={product.id} product={mapToCardProduct(product)} index={i} />
        ))}
      </div>
    </section>
  );
}
