import { useFeaturedProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import { mapToCardProduct } from '@/components/home/FlashDeals';

export default function FeaturedProducts() {
  const { data: featured, isLoading } = useFeaturedProducts();

  if (isLoading) {
    return (
      <section className="px-4 mt-8">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-lg border animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  if (!featured?.length) return null;

  return (
    <section className="px-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Products</h2>
        <a href="/catalog" className="text-sm font-medium text-primary hover:underline">
          View All →
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {featured.map((product, i) => (
          <ProductCard key={product.id} product={mapToCardProduct(product)} index={i} />
        ))}
      </div>
    </section>
  );
}
