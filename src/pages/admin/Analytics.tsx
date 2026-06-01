import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(12, 90%, 50%)', 'hsl(42, 100%, 50%)', 'hsl(220, 90%, 56%)', 'hsl(142, 71%, 45%)', 'hsl(280, 70%, 50%)'];

export default function AdminAnalytics() {
  const [brandData, setBrandData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [ordersByMonth, setOrdersByMonth] = useState<any[]>([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const { data: products } = await supabase.from('products').select('brand, gender, sold_count, price');
    const { data: orders } = await supabase.from('orders').select('total, created_at');

    if (products) {
      const brands: Record<string, number> = {};
      const genders: Record<string, number> = {};
      products.forEach(p => {
        brands[p.brand] = (brands[p.brand] || 0) + (p.sold_count || 0);
        const g = p.gender || 'unisex';
        genders[g] = (genders[g] || 0) + 1;
      });
      setBrandData(Object.entries(brands).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })));
      setGenderData(Object.entries(genders).map(([name, value]) => ({ name, value })));
    }

    if (orders) {
      const months: Record<string, number> = {};
      orders.forEach(o => {
        const m = new Date(o.created_at).toLocaleDateString('en', { year: '2-digit', month: 'short' });
        months[m] = (months[m] || 0) + Number(o.total);
      });
      setOrdersByMonth(Object.entries(months).map(([name, revenue]) => ({ name, revenue })));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Month</CardTitle></CardHeader>
          <CardContent>
            {ordersByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="hsl(12, 90%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-12">No order data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Products by Gender</CardTitle></CardHeader>
          <CardContent>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-12">No product data yet</p>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Sales by Brand</CardTitle></CardHeader>
          <CardContent>
            {brandData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={brandData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" fontSize={12} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(42, 100%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-12">No sales data yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
