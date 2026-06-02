import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { MessageCircle, Truck, Shield, Clock, Smartphone, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

type PaymentMethod = 'cash_on_delivery' | 'mpesa';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const shippingFee = totalPrice >= 5000 ? 0 : 300;
  const grandTotal = totalPrice + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatPhoneTo254 = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) return '254' + clean.slice(1);
    if (clean.startsWith('254')) return clean;
    if (clean.startsWith('+254')) return clean.slice(1);
    return '254' + clean;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    if (paymentMethod === 'mpesa' && !mpesaPhone) {
      toast({ title: 'Please enter your M-Pesa phone number', variant: 'destructive' });
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: grandTotal,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: 'pending',
          notes: form.notes || null,
          shipping_address: {
            full_name: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
          },
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.selectedSize,
        color: item.selectedColor,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // If M-Pesa, trigger STK push
      if (paymentMethod === 'mpesa') {
        const formattedPhone = formatPhoneTo254(mpesaPhone);
        
        const { data: stkData, error: stkError } = await supabase.functions.invoke('mpesa-stk-push', {
          body: {
            phone: formattedPhone,
            amount: grandTotal,
            orderId: order.id,
          },
        });

        if (stkError) {
          toast({
            title: 'M-Pesa request sent',
            description: 'If you received an STK prompt, enter your PIN. Otherwise try again or use Cash on Delivery.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: '📱 M-Pesa prompt sent!',
            description: `Check your phone (${formattedPhone}) and enter your M-Pesa PIN to complete payment.`,
          });
        }
      } else {
        toast({
          title: 'Order placed successfully!',
          description: `Order #${order.id.slice(0, 8).toUpperCase()} — Delivery within 24 hours`,
        });
      }

      clearCart();
      navigate('/account/orders');
    } catch (err: any) {
      toast({ title: 'Failed to place order', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const itemsList = items
      .map(item => `• ${item.product.name} (Size: ${item.selectedSize}, Color: ${item.selectedColor}) x${item.quantity} — KES ${(item.product.price * item.quantity).toLocaleString()}`)
      .join('\n');
    const message = `Hi TradeMall! I'd like to place an order:\n\n${itemsList}\n\nSubtotal: KES ${totalPrice.toLocaleString()}\nShipping: KES ${shippingFee.toLocaleString()}\nTotal: KES ${grandTotal.toLocaleString()}\n\nName: ${form.fullName}\nPhone: ${form.phone}\nAddress: ${form.address}, ${form.city}\nNotes: ${form.notes || 'None'}`;
    window.open(`https://wa.me/254791054940?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/catalog')}>Continue Shopping</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Shipping form + Payment method */}
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="0712345678" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Street, Building, Apartment" />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Nairobi" />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Special delivery instructions..." rows={3} />
              </div>
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">M-Pesa</p>
                    <p className="text-xs text-muted-foreground">Pay via Lipa Na M-Pesa</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive</p>
                  </div>
                </button>
              </div>

              {/* M-Pesa phone input */}
              {paymentMethod === 'mpesa' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4"
                >
                  <Label htmlFor="mpesaPhone" className="text-green-800 dark:text-green-300 font-medium">
                    M-Pesa Phone Number
                  </Label>
                  <Input
                    id="mpesaPhone"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="0712345678"
                    className="mt-1 border-green-300 dark:border-green-700"
                  />
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    💡 You'll receive an STK push prompt on this number. Enter your M-Pesa PIN to complete payment.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Delivery info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-accent/30 border border-accent rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Fast Delivery — Within 24 Hours</p>
                  <p className="text-xs text-muted-foreground">Orders placed before 4 PM are delivered the same day in Nairobi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Free Shipping on orders over KES 5,000</p>
                  <p className="text-xs text-muted-foreground">Standard shipping fee: KES 300</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">100% Authentic Products</p>
                  <p className="text-xs text-muted-foreground">All items are original with manufacturer warranty</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border p-6 h-fit sticky top-4">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover rounded-md bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Size: {item.selectedSize} · {item.selectedColor} · x{item.quantity}</p>
                    <p className="text-sm font-semibold text-primary">KES {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>KES {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `KES ${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-card-foreground border-t pt-2">
                <span>Total</span>
                <span>KES {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Button onClick={handlePlaceOrder} disabled={loading} className="w-full" size="lg">
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'mpesa'
                    ? `Pay KES ${grandTotal.toLocaleString()} via M-Pesa`
                    : 'Place Order — Cash on Delivery'}
              </Button>
              <Button onClick={handleWhatsAppOrder} variant="outline" className="w-full gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700" size="lg">
                <MessageCircle className="h-5 w-5" />
                Order via WhatsApp
              </Button>
            </div>

            <div className="mt-4 bg-accent/40 border border-accent rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">📞 Order Confirmation Call</p>
              <p className="text-[11px] text-muted-foreground">After placing your order, our admin will call you to confirm the order details and delivery schedule.</p>
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-3">
              By placing your order you agree to TradeMall's terms & conditions
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
