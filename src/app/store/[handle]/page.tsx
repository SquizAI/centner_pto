import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { shopifyClient } from '@/lib/shopify/client'
import ProductDetailClient from './product-detail-client'

interface ProductPageProps {
  params: Promise<{
    handle: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await shopifyClient.getProductByHandle(handle)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.title} | PTO Store`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images.map((url) => ({ url })),
    },
  }
}

export const revalidate = 60

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params

  try {
    const product = await shopifyClient.getProductByHandle(handle)

    if (!product) {
      notFound()
    }

    // Get related products from the same category
    const relatedProducts = product.collections.length > 0
      ? await shopifyClient.getProductsByCollection(product.collections[0].handle, 4)
      : []

    // Filter out the current product from related products
    const filteredRelatedProducts = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3)

    return <ProductDetailClient product={product} relatedProducts={filteredRelatedProducts} />
  } catch (error) {
    console.error('Error loading product:', error)
    notFound()
  }
}
