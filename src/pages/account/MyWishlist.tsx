import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function MyWishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['my-wishlist', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (wishlistId: string) => {
      const { error } = await supabase.from('wishlist').delete().eq('id', wishlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
      toast({ title: 'Removed from wishlist' });
    },
  });

  const handleAddToCart = (product: any) => {
    const sizes = product.sizes || [];
    const colors = product.colors || [];
    addToCart(
      { ...product, images: product.images || ['/placeholder.svg'] },
      sizes[0] || 40,
      colors[0]?.name || 'Default'
    );
  };

  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{[1, 2, 3].map(i => <div key={i} className="h-48 bg-card border rounded-lg animate-pulse" />)}</div>;

  if (!wishlistItems?.length) {
    return (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-lg font-medium text-foreground">Your wishlist is empty</p>
        <p className="text-sm text-muted-foreground">Save items you love for later</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">My Wishlist ({wishlistItems.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlistItems.map((item: any) => {
          const product = item.products;
          if (!product) return null;
          return (
            <div key={item.id} className="bg-card border rounded-lg overflow-hidden">
              <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-40 object-cover bg-secondary" />
              <div className="p-3">
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <p className="text-sm font-semibold text-card-foreground truncate">{product.name}</p>
                <p className="text-sm font-bold text-primary mt-1">KES {Number(product.price).toLocaleString()}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 gap-1" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeMutation.mutate(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
