import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Are your products authentic?', a: 'Yes, all products sold on TradeMall are 100% authentic. We source directly from authorized distributors and verified suppliers.' },
  { q: 'How long does delivery take?', a: 'We offer countrywide delivery within 24 hours of placing your order. Deliveries within Nairobi and Bondo are often same-day.' },
  { q: 'What payment methods do you accept?', a: 'We accept M-Pesa, Visa, and PayPal. M-Pesa is our most popular payment option — simply enter your phone number at checkout and confirm the STK push on your phone.' },
  { q: 'Can I return or exchange a product?', a: 'Yes, we accept returns within 7 days of delivery if the product is unused and in its original packaging. Contact us at 0791054940 to initiate a return.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking number via SMS. You can also view your order status on the "My Orders" page in your account.' },
  { q: 'Do you have physical stores?', a: 'Yes! We have stores in Nairobi and Bondo where you can visit to see and try on products before purchasing.' },
  { q: 'How do I contact customer support?', a: 'You can reach us at 0791054940 during business hours (Mon–Sat 8AM–8PM, Sun 9AM–5PM). You can also email us at support@trademall.co.ke.' },
  { q: 'Is there free shipping?', a: 'Yes! Orders above KES 5,000 qualify for free shipping countrywide.' },
  { q: 'How do I create an account?', a: 'Click the user icon in the top navigation bar and select "Sign Up". Enter your email and password to create your account.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are shipped. Contact our support team immediately if you need to cancel an order.' },
];

export default function FAQs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">Find answers to the most common questions about TradeMall.</p>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border px-4">
              <AccordionTrigger className="text-left text-sm font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
}
