import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, User, Eye, Phone, MapPin, ShoppingBag, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
  };

  const openDetail = async (profile: any) => {
    setSelected(profile);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('created_at', { ascending: false })
      .limit(20);
    setCustomerOrders(data || []);
    setDetailOpen(true);
  };

  const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const filtered = profiles.filter(p =>
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search) ||
    (p.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Customers ({profiles.length})</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">City</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Address</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <p className="font-medium text-foreground">{p.full_name || 'No name'}</p>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{p.phone || '-'}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{p.city || '-'}</td>
                    <td className="p-3 text-muted-foreground hidden lg:table-cell truncate max-w-[200px]">{p.address || '-'}</td>
                    <td className="p-3 text-muted-foreground hidden lg:table-cell">{format(new Date(p.created_at), 'MMM d, yyyy')}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(p)}><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No customers found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Customer Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {selected.avatar_url ? <img src={selected.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{selected.full_name || 'No name'}</h3>
                  <p className="text-xs text-muted-foreground">Joined {format(new Date(selected.created_at), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selected.phone || 'No phone'}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-foreground">{selected.address ? `${selected.address}, ${selected.city || ''}` : 'No address'}</span>
                </div>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold text-foreground">{customerOrders.length}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-foreground">KES {totalSpent.toLocaleString()}</p>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Order History
                </h3>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">#{o.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">KES {Number(o.total).toLocaleString()}</p>
                          <Badge className={
                            o.status === 'completed' || o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>{o.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
