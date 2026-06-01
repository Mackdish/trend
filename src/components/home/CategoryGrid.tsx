import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const cats = [
  { id: 'men', label: 'Men', emoji: '👟', desc: 'Sneakers & shoes' },
  { id: 'women', label: 'Women', emoji: '👠', desc: 'Stylish footwear' },
  { id: 'kids', label: 'Kids', emoji: '🧒', desc: 'Fun & comfy' },
  { id: 'running', label: 'Running', emoji: '🏃', desc: 'Performance gear' },
  { id: 'casual', label: 'Casual', emoji: '🎒', desc: 'Everyday comfort' },
  { id: 'new', label: 'New In', emoji: '✨', desc: 'Latest arrivals' },
];

export default function CategoryGrid() {
  return (
    <section className="px-4 mt-8">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Shop by Category</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {cats.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/catalog?category=${cat.id}`}
              className="flex flex-col items-center p-4 bg-card rounded-xl border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <span className="text-sm font-semibold text-card-foreground">{cat.label}</span>
              <span className="text-[10px] text-muted-foreground">{cat.desc}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
