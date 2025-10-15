import { BlogPostContentSkeleton, NewsGridSkeleton } from '@/components/news';
import { ArrowLeft } from 'lucide-react';

export default function PostLoading() {
  return (
    <div className="min-h-screen">
      {/* Back to News Link Skeleton */}
      <div className="container mx-auto px-4 pt-8">
        <div className="inline-flex items-center gap-2 mb-8">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Main Post Content Skeleton */}
      <article className="container mx-auto px-4 py-8">
        <BlogPostContentSkeleton />
      </article>

      {/* Related Posts Section Skeleton */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="h-9 w-48 bg-muted rounded-lg mb-8 animate-pulse" />
        <NewsGridSkeleton columns={3} count={3} />
      </section>

      {/* Call to Action Skeleton */}
      <section className="bg-primary/5 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="h-8 w-64 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-muted rounded-lg mx-auto mb-6 animate-pulse" />
          <div className="h-11 w-56 bg-muted rounded-lg mx-auto animate-pulse" />
        </div>
      </section>
    </div>
  );
}
