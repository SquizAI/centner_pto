import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, ArrowLeft } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-gray-100 p-8 rounded-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the product you're looking for. It may have been removed or is no longer available.
          </p>
          <Link href="/store">
            <Button size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
