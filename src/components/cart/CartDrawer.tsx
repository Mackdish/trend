import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent('/checkout')}`);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-foreground/40 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-card-foreground">Shopping Cart ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-secondary rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-muted-foreground text-lg mb-2">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mb-4">Add some awesome sneakers!</p>
                  <Link to="/catalog" onClick={() => setIsCartOpen(false)} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 bg-secondary/30 rounded-lg p-3">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded-md bg-secondary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                      <p className="text-sm font-semibold text-card-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.selectedSize} · {item.selectedColor}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 bg-secondary rounded hover:bg-border transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 bg-secondary rounded hover:bg-border transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-primary">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="self-start p-1 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold text-card-foreground">KES {totalPrice.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  {user ? 'Checkout' : 'Sign in to checkout'}
                </button>
                <Link to="/catalog" onClick={() => setIsCartOpen(false)} className="block w-full text-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Continue Shopping
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
