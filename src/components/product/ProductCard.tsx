import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0].name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="bg-card rounded-lg overflow-hidden product-card-hover border">
          {/* Image */}
          <div className="relative aspect-square bg-secondary/50 overflow-hidden">
            <img
              src={product.images[0]}
              alt={`${product.name} by ${product.brand} — Buy online in Kenya at TradeMall`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.discount && (
                <span className="sale-badge">-{product.discount}%</span>
              )}
              {product.isNew && (
                <span className="bg-[hsl(var(--badge-new))] text-[hsl(var(--badge-new-foreground))] font-semibold text-xs px-2 py-0.5 rounded">NEW</span>
              )}
              {product.isFlashDeal && (
                <span className="flash-badge">⚡ FLASH</span>
              )}
            </div>

            {/* Quick actions overlay */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
            <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="bg-card/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-card transition-colors"
              >
                <Heart className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={handleQuickAdd}
                className="bg-primary text-primary-foreground p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{product.brand}</p>
            <h3 className="text-sm font-semibold text-card-foreground mt-0.5 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-star text-star' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-base font-bold text-primary">
                KES {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  KES {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.soldCount && (
              <p className="text-[10px] text-muted-foreground mt-1">{product.soldCount.toLocaleString()} sold</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
