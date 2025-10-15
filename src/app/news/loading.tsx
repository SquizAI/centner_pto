import { NewsFeaturedSkeleton, NewsGridSkeleton } from '@/components/news';

export default function NewsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header Skeleton */}
      <header className="mb-12 text-center">
        <div className="h-12 w-96 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-[600px] bg-muted rounded-lg mx-auto animate-pulse" />
      </header>

      {/* Featured Post Skeleton */}
      <section className="mb-16">
        <NewsFeaturedSkeleton />
      </section>

      {/* Latest Updates Section Header Skeleton */}
      <section>
        <div className="h-8 w-48 bg-muted rounded-lg mb-8 animate-pulse" />
        <NewsGridSkeleton columns={3} count={6} />
      </section>
    </div>
  );
}
