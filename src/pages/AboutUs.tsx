import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Store, Users, Truck, ShieldCheck } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">About TradeMall</h1>
        <p className="text-muted-foreground mb-8">Your one-stop destination for authentic sneakers and shoes in Kenya.</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              TradeMall was founded by <strong className="text-foreground">Macknon Vulimu</strong> and <strong className="text-foreground">Tatu Changaya</strong> with a simple mission: to make authentic, quality footwear accessible to everyone across Kenya. What started as a passion for sneaker culture has grown into a trusted online marketplace serving thousands of happy customers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Our Stores</h2>
            <p className="text-muted-foreground leading-relaxed">
              We operate physical stores in <strong className="text-foreground">Nairobi</strong> and <strong className="text-foreground">Bondo</strong>, giving our customers the option to see and try on products before purchasing. Our online store extends our reach to every corner of Kenya with countrywide delivery.
            </p>
          </section>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            {[
              { icon: Store, label: '2 Stores', desc: 'Nairobi & Bondo' },
              { icon: Users, label: '1000+', desc: 'Happy Customers' },
              { icon: Truck, label: '24hrs', desc: 'Fast Delivery' },
              { icon: ShieldCheck, label: '100%', desc: 'Authentic Products' },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-xl border p-4 text-center">
                <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-bold text-lg">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-3">Why Choose TradeMall?</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>100% authentic sneakers and shoes from top global brands</li>
              <li>Competitive prices with regular flash deals and discounts</li>
              <li>Countrywide delivery within 24 hours</li>
              <li>Easy M-Pesa payments for a seamless checkout experience</li>
              <li>Dedicated customer support via phone and email</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
