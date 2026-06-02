import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 2, 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using TradeMall (trademall.co.ke), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Products & Pricing</h2>
            <p>All products listed on TradeMall are 100% authentic. Prices are listed in Kenyan Shillings (KES) and may be subject to change without prior notice. We reserve the right to correct pricing errors.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Orders & Payments</h2>
            <p>By placing an order, you agree to provide accurate shipping and payment information. We accept M-Pesa, Visa, and PayPal. Orders are confirmed once payment is received and verified.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Shipping & Delivery</h2>
            <p>We offer countrywide delivery within Kenya. Standard delivery is within 24 hours. Free shipping applies to orders above KES 5,000. TradeMall is not liable for delays caused by courier services or unforeseen circumstances.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Returns & Refunds</h2>
            <p>Products may be returned within 7 days of delivery if they are unused and in original packaging. Refunds are processed within 5 business days after we receive and inspect the returned item. Shipping costs for returns are borne by the customer unless the product was defective or incorrect.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Intellectual Property</h2>
            <p>All content on TradeMall, including logos, images, and text, is the property of TradeMall and may not be reproduced without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Limitation of Liability</h2>
            <p>TradeMall shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Contact</h2>
            <p>For questions about these terms, contact us at 0791054940.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
