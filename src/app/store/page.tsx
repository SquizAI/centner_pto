import { Metadata } from 'next'
import { ShoppingBag, Shirt } from 'lucide-react'
import { shopifyClient } from '@/lib/shopify/client'
import StoreClient from './store-client'

export const metadata: Metadata = {
  title: 'PTO Store',
  description: 'Shop Centner Academy PTO merchandise and spirit wear',
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function StorePage() {
  try {
    // Fetch products from Shopify
    const { products } = await shopifyClient.getAllProducts(100)

    // Extract unique categories and tags
    const categories = Array.from(new Set(products.map((p) => p.productType).filter(Boolean)))
    const allTags = products.flatMap((p) => p.tags)
    const tags = Array.from(new Set(allTags))

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-accent to-secondary p-6 rounded-2xl shadow-xl">
                  <ShoppingBag className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              PTO Store
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Show your Centner pride! Shop spirit wear, merchandise, and exclusive items that support our school community.
            </p>
          </div>

          {/* Featured Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl text-center">
              <Shirt className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">Spirit Wear</h3>
              <p className="text-sm text-gray-500">T-shirts, hoodies, and more</p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-6 rounded-xl text-center">
              <ShoppingBag className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">Accessories</h3>
              <p className="text-sm text-gray-500">Bags, bottles & more</p>
            </div>
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 rounded-xl text-center">
              <ShoppingBag className="h-10 w-10 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">School Supplies</h3>
              <p className="text-sm text-gray-500">Quality items for students</p>
            </div>
          </div>

          {/* Products */}
          <StoreClient initialProducts={products} categories={categories} tags={tags} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading store:', error)

    // Fallback UI when Shopify is not configured
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
              <ShoppingBag className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Store Setup Required</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                The store is not yet configured. Please add your Shopify credentials to .env.local to enable the store.
              </p>
              <div className="text-left bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                <code className="text-xs text-gray-700">
                  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
                  <br />
                  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
