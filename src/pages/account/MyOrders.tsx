import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', icon: Clock, color: 'bg-red-100 text-red-800' },
};

export default function MyOrders() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('my-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['my-orders', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ['my-order-items', expandedOrder],
    enabled: !!expandedOrder,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name, images, brand)')
        .eq('order_id', expandedOrder!);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-card border rounded-lg animate-pulse" />)}</div>;

  if (!orders?.length) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-lg font-medium text-foreground">No orders yet</p>
        <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Order History</h2>
      {orders.map(order => {
        const config = statusConfig[order.status] || statusConfig.pending;
        const StatusIcon = config.icon;
        const isExpanded = expandedOrder === order.id;
        const address = order.shipping_address as any;

        return (
          <div key={order.id} className="bg-card border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4 text-left">
                <StatusIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-card-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={config.color}>{config.label}</Badge>
                <span className="text-sm font-bold text-card-foreground">KES {Number(order.total).toLocaleString()}</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t p-4 space-y-3 bg-secondary/10">
                {order.tracking_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Tracking:</span>
                    <span className="font-medium text-foreground">{order.tracking_number}</span>
                  </div>
                )}
                {address && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{address.full_name}</p>
                    <p>{address.address}, {address.city}</p>
                    <p>{address.phone}</p>
                  </div>
                )}
                {orderItems && (
                  <div className="space-y-2 mt-2">
                    {orderItems.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.products?.images?.[0] || '/placeholder.svg'} alt="" className="w-10 h-10 rounded object-cover bg-secondary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground truncate">{item.products?.name}</p>
                          <p className="text-xs text-muted-foreground">Size: {item.size} · {item.color} · x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-primary">KES {Number(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
