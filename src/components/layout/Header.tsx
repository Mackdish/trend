import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const categoryLinks = [
  { label: 'Men', path: '/catalog?category=men' },
  { label: 'Women', path: '/catalog?category=women' },
  { label: 'Kids', path: '/catalog?category=kids' },
  { label: 'Flash Deals', path: '/catalog?deals=true' },
];

const brandLinks = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Vans', 'Converse'];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrands, setShowBrands] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="topbar-gradient px-4 py-1.5">
        <div className="container mx-auto flex items-center justify-between text-topbar-foreground text-xs">
          <span className="font-medium">🔥 Free shipping on orders over KES 5,000</span>
          <div className="hidden sm:flex items-center gap-4">
            <span>📞 0705 186 502</span>
            <span>Track Order</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="nav-container shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-extrabold text-nav-foreground tracking-tight">
                TRADE<span className="text-primary">MALL</span>
              </h1>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sneakers, brands, styles..."
                  className="search-input pr-10"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Link to="/account/wishlist" className="hidden sm:flex items-center gap-1 text-nav-muted hover:text-nav-foreground transition-colors p-2">
                <Heart className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1 text-nav-muted hover:text-nav-foreground transition-colors p-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              {user ? (
                <div className="hidden sm:flex items-center gap-1">
                  {isAdmin && (
                    <Link to="/admin" className="text-nav-muted hover:text-nav-foreground transition-colors p-2" title="Admin Dashboard">
                      <LayoutDashboard className="h-5 w-5" />
                    </Link>
                  )}
                  <Link to="/account" className="text-nav-muted hover:text-nav-foreground transition-colors p-2">
                    <User className="h-5 w-5" />
                  </Link>
                  <button onClick={() => signOut()} className="text-nav-muted hover:text-nav-foreground transition-colors p-2" title="Sign Out">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="hidden sm:flex items-center gap-1 text-nav-muted hover:text-nav-foreground transition-colors p-2">
                  <User className="h-5 w-5" />
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-nav-foreground p-2"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="md:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sneakers..."
                className="search-input pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Category bar */}
        <div className="hidden md:block border-t border-nav-foreground/10">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1">
              {categoryLinks.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.path}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors hover:text-primary ${
                    cat.label === 'Flash Deals' ? 'text-primary font-bold' : 'text-nav-muted hover:text-nav-foreground'
                  }`}
                >
                  {cat.label === 'Flash Deals' && '⚡ '}
                  {cat.label}
                </Link>
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowBrands(!showBrands)}
                  onBlur={() => setTimeout(() => setShowBrands(false), 200)}
                  className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-nav-muted hover:text-nav-foreground transition-colors"
                >
                  Brands <ChevronDown className="h-3 w-3" />
                </button>
                <AnimatePresence>
                  {showBrands && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 bg-card rounded-lg shadow-xl border p-3 min-w-[180px] z-50"
                    >
                      {brandLinks.map((brand) => (
                        <Link
                          key={brand}
                          to={`/catalog?brand=${brand}`}
                          className="block px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
                        >
                          {brand}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card border-b overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {categoryLinks.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md"
                >
                  {cat.label}
                </Link>
              ))}
              <div className="border-t my-2" />
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brands</p>
              {brandLinks.map((brand) => (
                <Link
                  key={brand}
                  to={`/catalog?brand=${brand}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md"
                >
                  {brand}
                </Link>
              ))}
              <div className="border-t my-2" />
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md">
                My Account
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md">
                Wishlist
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
