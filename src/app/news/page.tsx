import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { NewsFeatured, NewsGrid } from '@/components/news';
import { NewsPost } from '@/types/news.types';

export const metadata: Metadata = {
  title: 'News & Updates | Centner Academy PTO',
  description: 'Stay up to date with the latest news, announcements, and updates from Centner Academy PTO.',
  openGraph: {
    title: 'News & Updates | Centner Academy PTO',
    description: 'Stay up to date with the latest news, announcements, and updates from Centner Academy PTO.',
    type: 'website',
  },
};

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

async function getPublishedPosts(): Promise<NewsPost[]> {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .lte('publish_date', new Date().toISOString())
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching news posts:', error);
    throw new Error('Failed to fetch news posts');
  }

  return posts || [];
}

export default async function NewsPage() {
  try {
    const posts = await getPublishedPosts();

    // Handle empty state
    if (posts.length === 0) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">News & Updates</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Stay tuned for the latest news and announcements from Centner Academy PTO.
            </p>
            <div className="text-muted-foreground">
              No news posts are currently available. Check back soon!
            </div>
          </div>
        </div>
      );
    }

    // Split featured post (first one) from the rest
    const [featuredPost, ...remainingPosts] = posts;

    return (
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            News & Updates
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay informed with the latest news, announcements, and updates from Centner Academy PTO.
          </p>
        </header>

        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-16">
            <NewsFeatured post={featuredPost} />
          </section>
        )}

        {/* Remaining Posts Grid */}
        {remainingPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8">Latest Updates</h2>
            <NewsGrid posts={remainingPosts} columns={3} />
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in NewsPage:', error);
    // Re-throw to be caught by error boundary
    throw error;
  }
}
