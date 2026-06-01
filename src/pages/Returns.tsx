import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { RotateCcw, CheckCircle, XCircle, Phone } from 'lucide-react';

export default function Returns() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Returns & Exchanges</h1>
        <p className="text-muted-foreground mb-8">We want you to be completely satisfied with your purchase.</p>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Return Policy</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">You may return any product within <strong className="text-foreground">7 days</strong> of delivery. Items must be unused, unworn, and in their original packaging with all tags attached.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border p-5">
              <CheckCircle className="h-5 w-5 text-primary mb-2" />
              <h3 className="font-semibold text-sm mb-2">Eligible for Return</h3>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• Wrong size received</li>
                <li>• Defective or damaged product</li>
                <li>• Wrong product delivered</li>
                <li>• Product doesn't match description</li>
              </ul>
            </div>
            <div className="bg-card rounded-xl border p-5">
              <XCircle className="h-5 w-5 text-destructive mb-2" />
              <h3 className="font-semibold text-sm mb-2">Not Eligible</h3>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• Worn or used products</li>
                <li>• Products without original packaging</li>
                <li>• Products returned after 7 days</li>
                <li>• Products with removed tags</li>
              </ul>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">How to Initiate a Return</h2>
            </div>
            <ol className="text-muted-foreground text-sm space-y-2 list-decimal pl-5">
              <li>Contact us at <strong className="text-foreground">0705 186 502</strong> or <strong className="text-foreground">0740 960 179</strong></li>
              <li>Provide your order number and reason for return</li>
              <li>Ship the product back or drop it at our Nairobi or Bondo store</li>
              <li>Refund is processed within 5 business days after inspection</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
