import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageSEO } from '@/hooks/usePageSEO';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { mapToCardProduct } from '@/components/home/FlashDeals';
import { SlidersHorizontal, X } from 'lucide-react';
import AIRecommendations from '@/components/product/AIRecommendations';

const brandsList = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Vans', 'Converse', 'Asics', 'New Balance'];
const sizeOptions = [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? [searchParams.get('brand')!] : []
  );
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [priceRange] = useState<[number, number]>([0, 25000]);
  const [sortBy, setSortBy] = useState('popular');

  const search = searchParams.get('search') || undefined;
  const deals = searchParams.get('deals') === 'true';

  usePageSEO({
    title: search ? `${search} — Shoes in Kenya` : deals ? 'Flash Deals on Shoes Kenya' : 'Shop Shoes Online Kenya — All Brands',
    description: search
      ? `Find ${search} shoes in Kenya at TradeMall. Authentic brands, fast delivery, M-Pesa accepted.`
      : 'Browse all shoes at TradeMall Kenya. Nike, Adidas, Puma & more. Best prices, free Nairobi delivery.',
  });

  const { data: allProducts, isLoading } = useProducts({
    search,
    isFlashDeal: deals || undefined,
    gender: selectedCategory || undefined,
    brand: selectedBrands.length === 1 ? selectedBrands[0] : undefined,
  });

  const filtered = useMemo(() => {
    if (!allProducts) return [];
    let result = [...allProducts];

    if (selectedBrands.length > 1) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }
    if (selectedSize) result = result.filter(p => p.sizes.includes(selectedSize));
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'newest': result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0)); break;
      default: result.sort((a, b) => (b.sold_count ?? 0) - (a.sold_count ?? 0));
    }
    return result;
  }, [allProducts, selectedBrands, selectedSize, priceRange, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategory('');
    setSelectedSize(null);
  };

  const activeFilterCount = selectedBrands.length + (selectedCategory ? 1 : 0) + (selectedSize ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {search ? `Results for "${search}"` : deals ? '⚡ Flash Deals on Shoes in Kenya' : 'Shop Shoes Online in Kenya'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} products found</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border rounded-lg px-3 py-2 bg-card text-card-foreground">
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className={`${showFilters ? 'fixed inset-0 z-40 bg-card p-4 overflow-y-auto' : 'hidden'} md:block md:static md:w-56 flex-shrink-0`}>
            <div className="flex items-center justify-between md:hidden mb-4">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
            </div>
            {activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs text-primary hover:underline mb-4 block">Clear all filters</button>}

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-2">Category</h4>
              <div className="space-y-1.5">
                {['men', 'women', 'kids'].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'}`}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-2">Brand</h4>
              <div className="space-y-1.5">
                {brandsList.map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="rounded border-input text-primary focus:ring-primary" />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-2">Size</h4>
              <div className="flex flex-wrap gap-1.5">
                {sizeOptions.map(size => (
                  <button key={size} onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                    className={`w-10 h-8 text-xs rounded border transition-colors ${selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border hover:border-primary/50'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:hidden mt-6">
              <button onClick={() => setShowFilters(false)} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium">Show {filtered.length} results</button>
            </div>
          </aside>

          <div className="flex-1">
            {search && <AIRecommendations searchQuery={search} />}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-card rounded-lg border animate-pulse aspect-[3/4]" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No products found</p>
                <button onClick={clearFilters} className="mt-3 text-primary hover:underline text-sm">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {filtered.map((product, i) => <ProductCard key={product.id} product={mapToCardProduct(product)} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
