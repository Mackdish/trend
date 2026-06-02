import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 2, 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, shipping address, and payment information (processed securely via M-Pesa, Visa, or PayPal).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and deliver your orders</li>
              <li>To send order confirmations and shipping updates via SMS and email</li>
              <li>To provide customer support</li>
              <li>To improve our products and services</li>
              <li>To send promotional offers (only with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Information Sharing</h2>
            <p>We do not sell or share your personal information with third parties, except as necessary to process payments (M-Pesa/Visa/PayPal), deliver your orders (courier partners), or comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. Payment data is processed through secure, encrypted channels and is never stored on our servers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>We use essential cookies to maintain your session and shopping cart. We do not use third-party tracking cookies without your explicit consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time through your account settings. You may also contact us at 0791054940 to request data deletion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at 0791054940, or email support@trademall.co.ke.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
