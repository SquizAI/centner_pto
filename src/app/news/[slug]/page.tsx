import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BlogPostContent, NewsGrid } from '@/components/news';
import { NewsPost } from '@/types/news.types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// Fetch single post by slug
async function getPostBySlug(slug: string): Promise<NewsPost | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .lte('publish_date', new Date().toISOString())
    .single();

  if (error || !post) {
    return null;
  }

  return post;
}

// Fetch related posts from the same campus
async function getRelatedPosts(
  campus: string,
  currentPostId: string,
  limit = 3
): Promise<NewsPost[]> {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .eq('campus', campus)
    .neq('id', currentPostId)
    .lte('publish_date', new Date().toISOString())
    .order('publish_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return posts || [];
}

// Generate static params for all published posts (ISR)
export async function generateStaticParams() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('news_posts')
    .select('slug')
    .eq('published', true);

  if (error || !posts) {
    return [];
  }

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Centner Academy PTO',
    };
  }

  const title = `${post.title} | Centner Academy PTO`;
  const description = post.excerpt || `Read ${post.title} on Centner Academy PTO News`;
  const imageUrl = post.featured_image_url || '/default-news-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publish_date || undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const post = await getPostBySlug(slug);

  // If post not found or not published, show 404
  if (!post) {
    notFound();
  }

  // Fetch related posts from the same campus
  const relatedPosts = await getRelatedPosts(post.campus, post.id);

  return (
    <div className="min-h-screen">
      {/* Back to News Link */}
      <div className="container mx-auto px-4 pt-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>
      </div>

      {/* Main Post Content */}
      <article className="container mx-auto px-4 py-8">
        <BlogPostContent post={post} authorName="Centner PTO Team" />
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16 border-t">
          <h2 className="text-3xl font-bold mb-8">Related Posts</h2>
          <NewsGrid posts={relatedPosts} columns={3} />
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-primary/5 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest news and updates from Centner Academy PTO directly in your inbox.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Subscribe to Newsletter
          </Link>
        </div>
      </section>
    </div>
  );
}
