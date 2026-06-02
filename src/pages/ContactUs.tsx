import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We'd love to hear from you. Reach out through any of the channels below.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground text-sm">0791054940</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground text-sm">support@trademall.co.ke</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Stores</h3>
                <p className="text-muted-foreground text-sm">Nairobi, Kenya</p>
                <p className="text-muted-foreground text-sm">Bondo, Kenya</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Business Hours</h3>
                <p className="text-muted-foreground text-sm">Mon – Sat: 8:00 AM – 8:00 PM</p>
                <p className="text-muted-foreground text-sm">Sun: 9:00 AM – 5:00 PM</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Send us a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input placeholder="Your Name" className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <input placeholder="Your Email" type="email" className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <textarea placeholder="Your Message" rows={4} className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              <button type="submit" className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">Send Message</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
