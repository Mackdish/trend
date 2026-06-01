import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { blogPosts as staticPosts } from '@/data/blogPosts';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import NotFound from './NotFound';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: dbPost, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug!)
        .eq('published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fallback to static data
  const staticPost = staticPosts.find((p) => p.slug === slug);

  const post = dbPost
    ? {
        title: dbPost.title,
        slug: dbPost.slug,
        excerpt: dbPost.excerpt || '',
        content: dbPost.content || '',
        category: dbPost.category || '',
        image: dbPost.image || '',
        author: dbPost.author || 'TradeMall Team',
        date: new Date(dbPost.created_at).toISOString().slice(0, 10),
        readTime: dbPost.read_time || '5 min read',
        tags: dbPost.tags || [],
      }
    : staticPost
    ? {
        title: staticPost.title,
        slug: staticPost.slug,
        excerpt: staticPost.excerpt,
        content: staticPost.content,
        category: staticPost.category,
        image: staticPost.image,
        author: staticPost.author,
        date: staticPost.date,
        readTime: staticPost.readTime,
        tags: staticPost.tags,
      }
    : null;

  usePageSEO({
    title: post ? post.title : 'Post Not Found',
    description: post?.excerpt,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</main>
        <Footer />
      </div>
    );
  }

  if (!post) return <NotFound />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <article>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">{post.category}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {post.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readTime}</span>
            <span>By {post.author}</span>
          </div>

          <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-xl mb-8" />

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary">
            {post.content.split('\n').map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith('## '))
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{trimmed.slice(3)}</h2>;
              if (trimmed.startsWith('### '))
                return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{trimmed.slice(4)}</h3>;
              if (trimmed.startsWith('**') && trimmed.endsWith('**'))
                return <p key={i} className="font-bold text-primary my-2">{trimmed.slice(2, -2)}</p>;
              if (trimmed.startsWith('- '))
                return <li key={i} className="ml-6 list-disc text-muted-foreground">{trimmed.slice(2)}</li>;
              if (/^\d+\./.test(trimmed))
                return <li key={i} className="ml-6 list-decimal text-muted-foreground">{trimmed.replace(/^\d+\.\s*/, '')}</li>;
              return <p key={i} className="text-muted-foreground mb-3 leading-relaxed">{trimmed}</p>;
            })}
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                <Tag className="h-3 w-3" /> {tag}
              </span>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
