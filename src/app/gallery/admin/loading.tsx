export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Gallery Admin</h1>
        <p className="text-muted-foreground text-lg">
          Create albums, upload photos, and manage the photo gallery.
        </p>
      </header>

      {/* Loading Skeletons */}
      <div className="space-y-8">
        {/* Create Album Card Skeleton */}
        <div className="border rounded-lg p-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-6" />
          <div className="space-y-4">
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
            <div className="h-24 w-full bg-muted animate-pulse rounded" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Albums List Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-4" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
