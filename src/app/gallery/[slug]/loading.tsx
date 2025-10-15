import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';

export default function AlbumLoading() {
  return (
    <div className="min-h-screen">
      {/* Back to Gallery Link */}
      <div className="container mx-auto px-4 pt-8">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
      </div>

      {/* Album Header Skeleton */}
      <header className="container mx-auto px-4 py-8">
        <div className="max-w-4xl">
          <div className="mb-4 h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-12 w-3/4 bg-muted animate-pulse rounded mb-4" />
          <div className="flex gap-4 mb-6">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>

      {/* Photos Loading */}
      <section className="container mx-auto px-4 py-8">
        <PhotoGallery photos={[]} loading />
      </section>
    </div>
  );
}
