'use client'

import { Product } from '@/lib/shopify/types'
import { formatPrice, isOnSale, getDiscountPercentage } from '@/lib/shopify/client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.availableForSale) {
      toast.error('This product is out of stock')
      return
    }

    if (product.variants.length === 0) {
      toast.error('No variants available')
      return
    }

    try {
      setIsAdding(true)
      // Add first available variant
      const firstVariant = product.variants[0]
      await addToCart(firstVariant.id, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  const onSale = isOnSale(product.price, product.compareAtPrice)
  const discountPercent = getDiscountPercentage(product.price, product.compareAtPrice)

  return (
    <Link
      href={`/store/${product.handle}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.availableForSale && (
            <Badge variant="destructive" className="font-semibold">
              Out of Stock
            </Badge>
          )}
          {onSale && product.availableForSale && (
            <Badge className="bg-red-500 hover:bg-red-600 font-semibold">
              {discountPercent}% OFF
            </Badge>
          )}
          {product.tags.includes('New') && (
            <Badge className="bg-green-500 hover:bg-green-600 font-semibold">
              New
            </Badge>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Type */}
        {product.productType && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.productType}
          </p>
        )}

        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {onSale && product.compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          size="sm"
          onClick={handleAddToCart}
          disabled={!product.availableForSale || isAdding || cartLoading}
        >
          {isAdding ? (
            <>
              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </Button>
      </div>
    </Link>
  )
}
