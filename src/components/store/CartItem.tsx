'use client'

import { CartItem as CartItemType } from '@/lib/shopify/types'
import { formatPrice } from '@/lib/shopify/client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, isLoading } = useCart()
  const [localQuantity, setLocalQuantity] = useState(item.quantity)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return

    setLocalQuantity(newQuantity)
    try {
      await updateQuantity(item.id, newQuantity)
    } catch (error) {
      // Revert on error
      setLocalQuantity(item.quantity)
    }
  }

  const handleRemove = async () => {
    try {
      await removeFromCart(item.id)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/store/${item.productHandle}`}
        className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
      >
        <Image
          src={item.image}
          alt={item.productTitle}
          fill
          className="object-cover hover:scale-105 transition-transform"
          sizes="100px"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/store/${item.productHandle}`}
          className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
        >
          {item.productTitle}
        </Link>

        {/* Variant Info */}
        {item.variantTitle !== 'Default Title' && (
          <p className="text-sm text-muted-foreground mt-1">{item.variantTitle}</p>
        )}

        {/* Options */}
        {item.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {item.options.map((option, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {option.name}: {option.value}
              </span>
            ))}
          </div>
        )}

        {/* Mobile Price */}
        <div className="md:hidden mt-2">
          <p className="font-semibold text-primary">{formatPrice(item.price)}</p>
        </div>
      </div>

      {/* Desktop Price */}
      <div className="hidden md:block text-right">
        <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => handleQuantityChange(localQuantity - 1)}
            disabled={isLoading || localQuantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-12 text-center text-sm font-semibold">{localQuantity}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => handleQuantityChange(localQuantity + 1)}
            disabled={isLoading}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleRemove}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>

      {/* Subtotal */}
      <div className="hidden lg:block text-right min-w-[100px]">
        <p className="font-bold text-gray-900">{formatPrice(item.subtotal)}</p>
      </div>
    </div>
  )
}
