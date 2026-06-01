import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Phone, MapPin, User, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<any>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const openDetail = async (order: any) => {
    setSelected(order);
    const [itemsRes, profileRes] = await Promise.all([
      supabase.from('order_items').select('*, products(name, images, brand)').eq('order_id', order.id),
      supabase.from('profiles').select('*').eq('user_id', order.user_id).maybeSingle(),
    ]);
    setItems(itemsRes.data || []);
    setCustomerProfile(profileRes.data);
    setDetailOpen(true);
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) toast.error(error.message);
    else { toast.success('Status updated'); load(); if (selected?.id === orderId) setSelected((prev: any) => ({ ...prev, status })); }
  };

  const updatePaymentStatus = async (orderId: string, payment_status: string) => {
    const { error } = await supabase.from('orders').update({ payment_status }).eq('id', orderId);
    if (error) toast.error(error.message);
    else { toast.success('Payment status updated'); load(); if (selected?.id === orderId) setSelected((prev: any) => ({ ...prev, payment_status })); }
  };

  const updateTracking = async (orderId: string, tracking: string) => {
    const { error } = await supabase.from('orders').update({ tracking_number: tracking }).eq('id', orderId);
    if (error) toast.error(error.message); else toast.success('Tracking updated');
  };

  const filtered = orders.filter(o => {
    const addr = o.shipping_address as any;
    const matchSearch = search === '' ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (addr?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (addr?.phone || '').includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Orders ({orders.length})</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by ID, name, or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Payment</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const addr = o.shipping_address as any;
                  return (
                    <tr key={o.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">#{o.id.slice(0, 8)}</td>
                      <td className="p-3">
                        <p className="font-medium text-foreground text-xs">{addr?.full_name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{addr?.phone || '-'}</p>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{format(new Date(o.created_at), 'MMM d, yyyy')}</td>
                      <td className="p-3 font-medium text-foreground">KES {Number(o.total).toLocaleString()}</td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge className={paymentColors[o.payment_status] || paymentColors.pending}>
                          {o.payment_status || 'pending'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(o)}><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order #{selected?.id.slice(0, 8).toUpperCase()}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Status & Payment Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Payment</p>
                  <Select value={selected.payment_status || 'pending'} onValueChange={v => updatePaymentStatus(selected.id, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="font-medium text-foreground text-sm mt-1">{selected.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-foreground text-sm mt-1">KES {Number(selected.total).toLocaleString()}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><User className="w-4 h-4" /> Customer Details</h3>
                {(() => {
                  const addr = selected.shipping_address as any;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground font-medium">{addr?.full_name || customerProfile?.full_name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">{addr?.phone || customerProfile?.phone || '-'}</span>
                      </div>
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                        <span className="text-foreground">{addr?.address}, {addr?.city}</span>
                      </div>
                      {customerProfile?.full_name && (
                        <div className="sm:col-span-2 text-xs text-muted-foreground">
                          Account: {customerProfile.full_name} · Joined {format(new Date(customerProfile.created_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Date & Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                  <p className="text-sm font-medium text-foreground">{format(new Date(selected.created_at), 'MMM d, yyyy · h:mm a')}</p>
                </div>
                <div>
                  <Label>Tracking Number</Label>
                  <div className="flex gap-2 mt-1">
                    <Input defaultValue={selected.tracking_number || ''} id="tracking-input" placeholder="Enter tracking number" />
                    <Button size="sm" onClick={() => {
                      const val = (document.getElementById('tracking-input') as HTMLInputElement)?.value;
                      updateTracking(selected.id, val);
                    }}>Save</Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-2">Order Items ({items.length})</h3>
                <div className="space-y-2">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                      <img src={item.products?.images?.[0] || '/placeholder.svg'} alt="" className="w-12 h-12 rounded object-cover bg-secondary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{item.products?.name || 'Product'}</p>
                        <p className="text-xs text-muted-foreground">{item.products?.brand} · Size: {item.size || '-'} · Color: {item.color || '-'} · Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground text-sm">KES {Number(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div>
                  <Label>Order Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1 bg-muted/50 rounded-lg p-3">{selected.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
