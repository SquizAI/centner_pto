export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <div className="h-28 w-28 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>

        {/* Categories Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded mx-auto mb-3" />
              <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-40 mx-auto" />
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-44 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
