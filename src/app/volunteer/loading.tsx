import { VolunteerGridSkeleton } from '@/components/volunteer';
import { Heart } from 'lucide-react';

export default function VolunteerLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header Skeleton */}
      <header className="mb-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6 animate-pulse">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div className="h-12 w-[500px] bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-[700px] bg-muted rounded-lg mx-auto mb-3 animate-pulse" />
        <div className="h-6 w-[600px] bg-muted rounded-lg mx-auto mb-8 animate-pulse" />

        {/* Quick Stats Skeleton */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div className="h-6 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* CTA Buttons Skeleton */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="h-12 w-40 bg-muted rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Filter Section Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Opportunities Grid Skeleton */}
      <section>
        <VolunteerGridSkeleton columns={3} count={6} />
      </section>
    </div>
  );
}
