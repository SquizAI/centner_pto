import { Metadata } from 'next'
import CartPageClient from './cart-client'

export const metadata: Metadata = {
  title: 'Shopping Cart | PTO Store',
  description: 'Review your cart and proceed to checkout',
}

export default function CartPage() {
  return <CartPageClient />
}
