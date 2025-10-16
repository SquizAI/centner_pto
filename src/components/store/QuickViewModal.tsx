'use client'

import { Product, ProductVariant } from '@/lib/shopify/types'
import { formatPrice, isOnSale, getDiscountPercentage } from '@/lib/shopify/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!product) return null

  const variant = selectedVariant || product.variants[0]
  const onSale = isOnSale(variant.price, variant.compareAtPrice)
  const discountPercent = getDiscountPercentage(variant.price, variant.compareAtPrice)

  const handleAddToCart = async () => {
    if (!variant) {
      toast.error('Please select a variant')
      return
    }

    try {
      setIsAdding(true)
      await addToCart(variant.id, quantity)
      onClose()
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Group variants by option (size, color, etc.)
  const variantOptions = product.variants.reduce((acc, v) => {
    v.options.forEach((opt) => {
      if (!acc[opt.name]) {
        acc[opt.name] = new Set()
      }
      acc[opt.name].add(opt.value)
    })
    return acc
  }, {} as Record<string, Set<string>>)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick View: {product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[currentImageIndex] || product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {!product.availableForSale && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                {onSale && product.availableForSale && (
                  <Badge className="bg-red-500 hover:bg-red-600">
                    {discountPercent}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="flex-1">
              {product.productType && (
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  {product.productType}
                </p>
              )}

              <h2 className="text-2xl font-bold mb-4">{product.title}</h2>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(variant.price)}
                </span>
                {onSale && variant.compareAtPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(variant.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm mb-6">
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Variant Options */}
              {Object.entries(variantOptions).map(([optionName, values]) => (
                <div key={optionName} className="mb-4">
                  <Label className="mb-2 block font-semibold">{optionName}</Label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(values).map((value) => {
                      const variantForOption = product.variants.find((v) =>
                        v.options.some((opt) => opt.name === optionName && opt.value === value)
                      )
                      const isSelected = variant?.options.some(
                        (opt) => opt.name === optionName && opt.value === value
                      )

                      return (
                        <Button
                          key={value}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => variantForOption && setSelectedVariant(variantForOption)}
                          disabled={!variantForOption?.availableForSale}
                        >
                          {value}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-6">
                <Label className="mb-2 block font-semibold">Quantity</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
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
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              <Link href={`/store/${product.handle}`} className="block">
                <Button variant="outline" className="w-full" size="lg" onClick={onClose}>
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Full Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
