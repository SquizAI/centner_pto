import { Metadata } from 'next'
import { ShoppingBag, Shirt, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'PTO Store',
  description: 'Shop Centner Academy PTO merchandise and spirit wear',
}

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-accent to-secondary p-6 rounded-2xl shadow-xl">
                <ShoppingBag className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            PTO Store
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Show your Centner pride! Shop spirit wear, merchandise, and exclusive items that support our school community.
          </p>

          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 md:p-16">
            <Package className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Store Opening Soon</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We are preparing an online store featuring exclusive Centner Academy merchandise and spirit wear. Stay tuned for the grand opening!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl">
                <Shirt className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Spirit Wear</h3>
                <p className="text-sm text-gray-500">T-shirts, hoodies, and more</p>
              </div>
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-6 rounded-xl">
                <Package className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">School Supplies</h3>
                <p className="text-sm text-gray-500">Quality items for students</p>
              </div>
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 rounded-xl">
                <ShoppingBag className="h-10 w-10 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Accessories</h3>
                <p className="text-sm text-gray-500">Bags, water bottles & more</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
