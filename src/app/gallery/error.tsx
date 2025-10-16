'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Gallery page error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unable to Load Gallery
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            We encountered an error while loading the photo gallery. This might be due to a connection issue or the gallery might be temporarily unavailable.
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 mb-6">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-sm text-gray-600">
            Our photo gallery is currently being set up. Check back soon to browse photos from all our amazing PTO events and activities!
          </p>
        </div>
      </div>
    </div>
  )
}
