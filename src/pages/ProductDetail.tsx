import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { mapToCardProduct } from '@/components/home/FlashDeals';
import { useCart } from '@/contexts/CartContext';
import { Star, Heart, ShoppingCart, ChevronRight, Truck, Shield, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import AIProductRecommendations from '@/components/product/AIProductRecommendations';
import { usePageSEO } from '@/hooks/usePageSEO';

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts } = useProducts();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  usePageSEO({
    title: product ? `${product.name} by ${product.brand} — Buy in Kenya` : 'Loading...',
    description: product ? `Buy ${product.name} (${product.brand}) in Kenya for KES ${product.price.toLocaleString()}. Authentic, in stock. Free Nairobi delivery. M-Pesa accepted.` : undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-card rounded-2xl border animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-secondary rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-secondary rounded w-3/4 animate-pulse" />
              <div className="h-8 bg-secondary rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
          <Link to="/catalog" className="text-primary hover:underline mt-4 inline-block">Back to catalog</Link>
        </div>
      </div>
    );
  }

  const related = (allProducts || [])
    .filter(p => p.id !== product.id && (p.gender === product.gender || p.brand === product.brand))
    .slice(0, 4);

  const cardProduct = mapToCardProduct(product);
  const displayImages = product.images.length ? product.images : ['/placeholder.svg'];

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes[0];
    const color = selectedColor || (product.colors[0]?.name ?? '');
    for (let i = 0; i < quantity; i++) {
      addToCart(cardProduct, size, color);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square bg-card rounded-2xl border overflow-hidden">
              <img src={displayImages[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">{product.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating ?? 0) ? 'fill-star text-star' : 'text-muted'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews_count} reviews)</span>
              {product.sold_count && <span className="text-sm text-muted-foreground">· {product.sold_count.toLocaleString()} sold</span>}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">KES {product.price.toLocaleString()}</span>
              {product.original_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">KES {product.original_price.toLocaleString()}</span>
                  <span className="sale-badge text-sm">-{product.discount}%</span>
                </>
              )}
            </div>

            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Color: {selectedColor || product.colors[0]?.name}</p>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button key={color.name} onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${(selectedColor || product.colors[0]?.name) === color.name ? 'border-primary scale-110' : 'border-border'}`}
                      style={{ backgroundColor: color.hex }} title={color.name} />
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Size (EU)</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-10 px-3 text-sm rounded-lg border transition-all font-medium ${(selectedSize || product.sizes[0]) === size ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-border hover:border-primary/50'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors">−</button>
                <span className="px-4 py-2.5 text-sm font-medium border-x">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors">+</button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
              <button className="p-3 border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <p className={`text-sm font-medium ${product.in_stock ? 'text-success' : 'text-destructive'}`}>
              {product.in_stock ? '✓ In Stock — Ready to ship' : '✗ Out of Stock'}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="flex flex-col items-center text-center p-3">
                <Truck className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <Shield className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <RotateCcw className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Easy Returns</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          </motion.div>
        </div>

        <AIProductRecommendations
          productId={product.id}
          productName={product.name}
          productBrand={product.brand}
          productGender={product.gender}
        />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {related.map((p, i) => <ProductCard key={p.id} product={mapToCardProduct(p)} index={i} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
