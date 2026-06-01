import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Truck, Clock, MapPin, Gift } from 'lucide-react';

export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Shipping Information</h1>
        <p className="text-muted-foreground mb-8">Everything you need to know about our delivery services.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { icon: Truck, title: 'Countrywide Delivery', desc: "We deliver to all 47 counties across Kenya. No matter where you are, we'll get your order to you." },
            { icon: Clock, title: 'Within 24 Hours', desc: 'All orders are processed and dispatched within 24 hours. Most deliveries arrive same-day.' },
            { icon: Gift, title: 'Free Shipping', desc: 'Enjoy free shipping on all orders above KES 5,000. Standard shipping rates apply for orders below this amount.' },
            { icon: MapPin, title: 'Pick Up Available', desc: 'You can also pick up your order from our stores in Nairobi or Bondo at no extra cost.' },
          ].map((item) => (
            <div key={item.title} className="bg-card rounded-xl border p-6">
              <item.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Shipping Rates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Destination</th>
                  <th className="text-left py-2 font-medium">Delivery Time</th>
                  <th className="text-left py-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b"><td className="py-2">Nairobi</td><td className="py-2">Same day – 12 hrs</td><td className="py-2">KES 200</td></tr>
                <tr className="border-b"><td className="py-2">Bondo</td><td className="py-2">Same day – 12 hrs</td><td className="py-2">KES 200</td></tr>
                <tr className="border-b"><td className="py-2">Major towns</td><td className="py-2">12 – 24 hrs</td><td className="py-2">KES 300</td></tr>
                <tr><td className="py-2">Other areas</td><td className="py-2">24 – 48 hrs</td><td className="py-2">KES 500</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">* Free shipping on orders above KES 5,000</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
