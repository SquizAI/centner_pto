'use client'

import { useState } from 'react'
import { Product, ProductVariant } from '@/lib/shopify/types'
import { formatPrice, isOnSale, getDiscountPercentage } from '@/lib/shopify/client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'
import ProductCard from '@/components/store/ProductCard'

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a variant')
      return
    }

    try {
      setIsAdding(true)
      await addToCart(selectedVariant.id, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const onSale = isOnSale(selectedVariant.price, selectedVariant.compareAtPrice)
  const discountPercent = getDiscountPercentage(selectedVariant.price, selectedVariant.compareAtPrice)

  // Group variants by option name
  const variantOptions = product.variants.reduce((acc, v) => {
    v.options.forEach((opt) => {
      if (!acc[opt.name]) {
        acc[opt.name] = []
      }
      if (!acc[opt.name].find((val) => val === opt.value)) {
        acc[opt.name].push(opt.value)
      }
    })
    return acc
  }, {} as Record<string, string[]>)

  // Get selected options
  const selectedOptions = selectedVariant.options.reduce((acc, opt) => {
    acc[opt.name] = opt.value
    return acc
  }, {} as Record<string, string>)

  // Handle option change
  const handleOptionChange = (optionName: string, value: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: value }

    // Find variant that matches the new selection
    const matchingVariant = product.variants.find((v) =>
      v.options.every((opt) => newSelectedOptions[opt.name] === opt.value)
    )

    if (matchingVariant) {
      setSelectedVariant(matchingVariant)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/store"
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Store
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
              <Image
                src={product.images[currentImageIndex] || product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {!product.availableForSale && (
                  <Badge variant="destructive" className="text-sm">
                    Out of Stock
                  </Badge>
                )}
                {onSale && product.availableForSale && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-sm">
                    {discountPercent}% OFF
                  </Badge>
                )}
                {product.tags.includes('New') && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-sm">
                    New
                  </Badge>
                )}
              </div>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="flex-1">
              {/* Product Type */}
              {product.productType && (
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  {product.productType}
                </p>
              )}

              {/* Product Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(selectedVariant.price)}
                </span>
                {onSale && selectedVariant.compareAtPrice && (
                  <span className="text-2xl text-muted-foreground line-through">
                    {formatPrice(selectedVariant.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-gray mb-8">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Variant Options */}
              {Object.entries(variantOptions).map(([optionName, values]) => (
                <div key={optionName} className="mb-6">
                  <label className="block font-semibold mb-3">
                    {optionName}: <span className="text-primary">{selectedOptions[optionName]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value) => {
                      const variantForOption = product.variants.find((v) =>
                        v.options.every((opt) =>
                          opt.name === optionName
                            ? opt.value === value
                            : selectedOptions[opt.name] === opt.value
                        )
                      )
                      const isSelected = selectedOptions[optionName] === value
                      const isAvailable = variantForOption?.availableForSale

                      return (
                        <Button
                          key={value}
                          variant={isSelected ? 'default' : 'outline'}
                          size="lg"
                          onClick={() => handleOptionChange(optionName, value)}
                          disabled={!isAvailable}
                          className="min-w-[80px] relative"
                        >
                          {value}
                          {isSelected && <Check className="h-4 w-4 ml-2" />}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-8">
                <label className="block font-semibold mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12"
                  >
                    -
                  </Button>
                  <span className="w-16 text-center font-semibold text-xl">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Stock Info */}
              {selectedVariant.quantityAvailable > 0 && selectedVariant.quantityAvailable <= 10 && (
                <p className="text-sm text-orange-600 mb-4">
                  Only {selectedVariant.quantityAvailable} left in stock!
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 sticky bottom-4 bg-white p-6 rounded-xl border shadow-lg">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.availableForSale || !selectedVariant.availableForSale || isAdding || cartLoading}
              >
                {isAdding ? (
                  <>
                    <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full" size="lg" onClick={handleShare}>
                <Share2 className="h-5 w-5 mr-2" />
                Share Product
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
