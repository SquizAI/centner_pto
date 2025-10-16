'use client'

import { formatPrice } from '@/lib/shopify/client'
import { Button } from '@/components/ui/button'
import { ExternalLink, ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function CartSummary() {
  const { cart } = useCart()

  if (!cart) return null

  const handleCheckout = () => {
    // Redirect to Shopify checkout
    window.location.href = cart.checkoutUrl
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({cart.itemCount} items)</span>
          <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="text-sm">Calculated at checkout</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(cart.total)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        className="w-full mb-3"
        size="lg"
        onClick={handleCheckout}
        disabled={cart.items.length === 0}
      >
        <ShoppingBag className="h-5 w-5 mr-2" />
        Proceed to Checkout
        <ExternalLink className="h-4 w-4 ml-2" />
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You will be redirected to secure Shopify checkout
      </p>

      {/* Shipping & Pickup Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold mb-3 text-sm">Delivery Options</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>Standard shipping available</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>Campus pickup option at checkout</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>Free pickup at school events</span>
          </li>
        </ul>
      </div>

      {/* Support PTO */}
      <div className="mt-6 pt-6 border-t border-gray-200 bg-gradient-to-br from-primary/5 to-accent/5 -mx-6 -mb-6 p-6 rounded-b-xl">
        <p className="text-sm text-center text-gray-700">
          <span className="font-semibold">Thank you!</span> Your purchase supports Centner Academy PTO programs and events.
        </p>
      </div>
    </div>
  )
}
