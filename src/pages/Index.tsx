import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import FlashDeals from '@/components/home/FlashDeals';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { usePageSEO } from '@/hooks/usePageSEO';

const Index = () => {
  usePageSEO({
    title: 'TradeMall Kenya — Buy Sneakers & Shoes Online | Nike, Adidas, Puma',
    description: "Kenya's #1 online shoe store. Shop authentic Nike, Adidas, Puma, New Balance sneakers for men, women & kids. Free delivery in Nairobi. Pay with M-Pesa.",
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl pb-8">
        <HeroBanner />
        <CategoryGrid />
        <FlashDeals />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
