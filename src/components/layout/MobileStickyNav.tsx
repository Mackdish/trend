import { Link, useLocation } from 'react-router-dom';
import { Grid3x3, ShoppingCart, CreditCard, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export default function MobileStickyNav() {
  const { totalItems } = useCart();
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const itemClass = (active: boolean) =>
    cn(
      'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
      active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch">
        <Link to="/catalog" className={itemClass(isActive('/catalog'))}>
          <Grid3x3 className="h-5 w-5" />
          <span>Categories</span>
        </Link>

        <Link to="/cart" className={cn(itemClass(isActive('/cart')), 'relative')}>
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Link>

        <Link to="/checkout" className={itemClass(isActive('/checkout'))}>
          <CreditCard className="h-5 w-5" />
          <span>Checkout</span>
        </Link>

        <Link to="/account" className={itemClass(isActive('/account'))}>
          <User className="h-5 w-5" />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
