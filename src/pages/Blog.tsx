import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { blogPosts as staticPosts } from '@/data/blogPosts';
import { Calendar, Clock } from 'lucide-react';

export default function Blog() {
  usePageSEO({
    title: 'Blog — Shoe Guides & Kenya Fashion Tips',
    description:
      'Read expert shoe guides, Kenya fashion trends, sneaker reviews, and style tips from TradeMall. Your go-to resource for footwear in Kenya.',
  });

  const { data: dbPosts } = useQuery({
    queryKey: ['public-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Merge DB posts + static fallback (DB first, then static ones not already in DB by slug)
  const dbSlugs = new Set((dbPosts || []).map((p) => p.slug));
  const allPosts = [
    ...(dbPosts || []).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || '',
      category: p.category || '',
      image: p.image || '',
      date: new Date(p.created_at).toISOString().slice(0, 10),
      readTime: p.read_time || '5 min read',
    })),
    ...staticPosts
      .filter((p) => !dbSlugs.has(p.slug))
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        image: p.image,
        date: p.date,
        readTime: p.readTime,
      })),
  ];

  if (allPosts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold mb-4">TradeMall Blog</h1>
          <p className="text-muted-foreground">Coming soon — stay tuned!</p>
        </main>
        <Footer />
      </div>
    );
  }

  const featured = allPosts[0];
  const rest = allPosts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">TradeMall Blog</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Expert shoe guides, Kenya fashion tips, and sneaker culture — everything you need to step out in style.
        </p>

        <Link to={`/blog/${featured.slug}`} className="group block mb-12">
          <article className="grid md:grid-cols-2 gap-6 bg-card rounded-2xl overflow-hidden border hover:shadow-xl transition-shadow">
            <img src={featured.image} alt={featured.title} className="w-full h-64 md:h-full object-cover" loading="eager" />
            <div className="p-6 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{featured.category}</span>
              <h2 className="text-2xl font-bold group-hover:text-primary transition-colors mb-3">{featured.title}</h2>
              <p className="text-muted-foreground mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {featured.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
              </div>
            </div>
          </article>
        </Link>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
              <article className="bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-shadow h-full flex flex-col">
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{post.category}</span>
                  <h3 className="font-bold group-hover:text-primary transition-colors mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
