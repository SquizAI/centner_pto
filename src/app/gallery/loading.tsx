import { AlbumGrid } from '@/components/gallery/AlbumGrid';

export default function GalleryLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Photo Gallery</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Browse photo albums from our school events and activities.
        </p>
      </header>

      {/* Loading Skeleton */}
      <AlbumGrid albums={[]} loading />
    </div>
  );
}
