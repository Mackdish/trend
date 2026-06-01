import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/hooks/usePageSEO";

const Cart = () => {
  const { items, setIsCartOpen, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToCheckout = () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent("/checkout")}`);
    } else {
      navigate("/checkout");
    }
  };

  // Toast on add or quantity update while viewing /cart
  const prevSnapshotRef = useRef<Map<string, number> | null>(null);
  useEffect(() => {
    const snapshot = new Map<string, number>();
    items.forEach((i) => {
      const key = `${i.product.id}__${i.selectedSize}__${i.selectedColor}`;
      snapshot.set(key, (snapshot.get(key) ?? 0) + i.quantity);
    });

    const prev = prevSnapshotRef.current;
    if (prev !== null) {
      let addedName: string | null = null;
      let updatedName: string | null = null;
      for (const [key, qty] of snapshot.entries()) {
        const prevQty = prev.get(key) ?? 0;
        if (qty > prevQty) {
          const item = items.find(
            (i) => `${i.product.id}__${i.selectedSize}__${i.selectedColor}` === key,
          );
          const name = item?.product.name ?? "Item";
          if (prevQty === 0) addedName = name;
          else updatedName = name;
        }
      }
      const message = addedName
        ? `${addedName} added to cart`
        : updatedName
          ? `${updatedName} quantity updated`
          : null;
      if (message) {
        const newTotal = Array.from(snapshot.values()).reduce((a, b) => a + b, 0);
        toast.success(message, {
          description: `${newTotal} item${newTotal === 1 ? "" : "s"} in your cart`,
          action: {
            label: "Checkout",
            onClick: () =>
              user
                ? navigate("/checkout")
                : navigate(`/auth?redirect=${encodeURIComponent("/checkout")}`),
          },
          cancel: {
            label: "Keep shopping",
            onClick: () => navigate("/catalog"),
          },
        });
      }
    }
    prevSnapshotRef.current = snapshot;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  usePageSEO({
    title: "Your Cart — TradeMall Kenya",
    description: "Review the shoes in your TradeMall cart and proceed to checkout.",
  });

  // Open the cart drawer as soon as the route mounts
  useEffect(() => {
    setIsCartOpen(true);
  }, [setIsCartOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="text-muted-foreground">
            {totalItems > 0
              ? `You have ${totalItems} item${totalItems === 1 ? "" : "s"} in your cart.`
              : "Your cart is currently empty."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setIsCartOpen(true)} size="lg">
              View cart drawer
            </Button>
            {totalItems > 0 ? (
              <Button
                variant="outline"
                size="lg"
                onClick={goToCheckout}
              >
                Checkout <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/catalog")}
              >
                Continue shopping
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
