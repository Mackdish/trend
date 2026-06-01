import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStock: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalCustomers: 0, totalRevenue: 0, pendingOrders: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentOrders();
    loadTopProducts();
  }, []);

  const loadStats = async () => {
    const [products, orders, customers, lowStock] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id, total, status'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }).lt('stock_quantity', 10),
    ]);

    const orderData = orders.data || [];
    const revenue = orderData.reduce((sum, o) => sum + Number(o.total), 0);
    const pending = orderData.filter(o => o.status === 'pending').length;

    setStats({
      totalProducts: products.count || 0,
      totalOrders: orderData.length,
      totalCustomers: customers.count || 0,
      totalRevenue: revenue,
      pendingOrders: pending,
      lowStock: lowStock.count || 0,
    });
  };

  const loadRecentOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
    setRecentOrders(data || []);
  };

  const loadTopProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sold_count', { ascending: false }).limit(5);
    setTopProducts(data || []);
  };

  const statCards = [
    { label: 'Total Revenue', value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-orange-600 bg-orange-50' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Low Stock', value: stats.lowStock, icon: ArrowUpRight, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">KES {Number(order.total).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : order.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Products</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sold_count || 0} sold</p>
                      </div>
                    </div>
                    <p className="font-medium text-foreground">KES {Number(p.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
