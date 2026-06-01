import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import heroHotDeals from '@/assets/hero-hot-deals.jpg';
import heroNewArrivals from '@/assets/hero-new-arrivals.jpg';
import heroFlashSale from '@/assets/hero-flash-sale.jpg';
import { useProducts } from '@/hooks/useProducts';
import { usePromotions } from '@/hooks/usePromotions';
import { useHeroSlides } from '@/hooks/useHeroSlides';

const imageMap: Record<string, string> = {
  'hot-deals': heroHotDeals,
  'new-arrivals': heroNewArrivals,
  'flash-sale': heroFlashSale,
};

const fallbackSlides = [
  {
    slide_key: 'hot-deals',
    tag: '🔥 Hot Deals',
    title: 'Buy Sneakers Online in Kenya',
    subtitle: 'Up to 50% off on authentic Nike, Adidas & Puma shoes. Free delivery in Nairobi.',
    cta_text: 'Shop Now',
    cta_link: '/catalog',
  },
  {
    slide_key: 'new-arrivals',
    tag: '🆕 New Arrivals',
    title: 'Fresh Kicks Just Landed',
    subtitle: 'Discover the latest styles from top brands. Be the first to rock new trends.',
    cta_text: 'Explore New',
    cta_link: '/catalog?filter=new',
  },
  {
    slide_key: 'flash-sale',
    tag: '⚡ Flash Sale',
    title: 'Limited Time Offers',
    subtitle: 'Grab unbeatable deals before they\'re gone. Up to 40% off select styles.',
    cta_text: 'View Deals',
    cta_link: '/catalog?filter=deals',
  },
];

function useCountdown(target: Date | null) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(target));

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function calcTimeLeft(target: Date | null) {
  if (!target) return null;
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, total: diff };
}

function CountdownTimer({ target, label }: { target: Date; label: string }) {
  const time = useCountdown(target);
  if (!time || time.total <= 0) return null;

  const units = [
    { value: time.days, label: 'D' },
    { value: time.hours, label: 'H' },
    { value: time.minutes, label: 'M' },
    { value: time.seconds, label: 'S' },
  ];

  return (
    <div className="flex items-center gap-2 mb-5">
      <Clock className="h-4 w-4 text-primary" />
      <span className="text-xs text-primary-foreground/70 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex gap-1.5">
        {units.map((u) => (
          <div key={u.label} className="flex items-baseline gap-0.5">
            <span className="bg-primary/90 text-primary-foreground text-sm md:text-base font-bold rounded-md px-1.5 py-0.5 min-w-[28px] text-center tabular-nums">
              {String(u.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-primary-foreground/60 font-semibold">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: products } = useProducts({ isFeatured: true });
  const featuredProducts = (products || []).slice(0, 4);

  const { data: promotions } = usePromotions();
  const promoMap = new Map((promotions || []).map((p) => [p.slide_key, p]));

  const { data: dbSlides } = useHeroSlides();
  const slides = (dbSlides && dbSlides.length > 0 ? dbSlides : fallbackSlides).map((s) => ({
    ...s,
    image: imageMap[s.slide_key] ?? heroHotDeals,
  }));

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <section className="relative mx-4 mt-4 space-y-4">
      {/* Hero Carousel */}
      <div className="relative overflow-hidden rounded-2xl group">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {slides.map((slide, i) => {
              const promo = promoMap.get(slide.slide_key);
              return (
                <div key={i} className="min-w-0 shrink-0 grow-0 basis-full relative">
                  <div className="relative min-h-[280px] md:min-h-[400px] flex items-center">
                    <img
                      src={slide.image}
                      alt={`${slide.title} — TradeMall Kenya`}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      width={1920}
                      height={800}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
                    <div className="relative z-10 p-8 md:p-16 max-w-lg">
                      <AnimatePresence mode="wait">
                        {selectedIndex === i && (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                              {slide.tag}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight mb-3">
                              {slide.title}
                            </h1>
                            <p className="text-primary-foreground/80 text-base md:text-lg mb-4">
                              {slide.subtitle}
                            </p>
                            {promo && (
                              <CountdownTimer
                                target={new Date(promo.ends_at)}
                                label={promo.label}
                              />
                            )}
                            <Link
                              to={slide.cta_link}
                              className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                              {slide.cta_text}
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                selectedIndex === i ? 'w-8 bg-primary' : 'w-2 bg-primary-foreground/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products Strip */}
      {featuredProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group/card flex items-center gap-3 bg-card rounded-xl p-3 border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <img
                src={product.images?.[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
                loading="lazy"
                width={56}
                height={56}
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                <p className="text-sm font-semibold text-foreground truncate group-hover/card:text-primary transition-colors">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-primary">
                  KES {product.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
