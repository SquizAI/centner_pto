import { Metadata } from 'next'
import { Camera, Image as ImageIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Photo Gallery',
  description: 'Browse photos from Centner Academy PTO events and activities',
}

export default function PhotosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-primary to-accent p-6 rounded-2xl shadow-xl">
                <Camera className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Photo Gallery
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Capture and relive the wonderful moments from our PTO events, school activities, and community gatherings.
          </p>

          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 md:p-16">
            <ImageIcon className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Coming Soon</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We are working on building an amazing photo gallery to showcase all the incredible moments from our community. Check back soon!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="px-4 py-2 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">Event Albums</p>
              </div>
              <div className="px-4 py-2 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">Campus Highlights</p>
              </div>
              <div className="px-4 py-2 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">Activity Photos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
