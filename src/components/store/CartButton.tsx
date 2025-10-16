'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export default function CartButton() {
  const { itemCount } = useCart()

  return (
    <Link href="/store/cart">
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
        <span className="sr-only">Shopping cart with {itemCount} items</span>
      </Button>
    </Link>
  )
}
