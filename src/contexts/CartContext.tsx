'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { shopifyClient } from '@/lib/shopify/client'
import { Cart, CartItem } from '@/lib/shopify/types'
import { toast } from 'sonner'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  itemCount: number
  addToCart: (variantId: string, quantity: number) => Promise<void>
  removeFromCart: (lineId: string) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_ID_KEY = 'shopify_cart_id'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize cart on mount
  useEffect(() => {
    initializeCart()
  }, [])

  const initializeCart = async () => {
    try {
      setIsLoading(true)

      // Check if we have a cart ID in localStorage
      const savedCartId = localStorage.getItem(CART_ID_KEY)

      if (savedCartId) {
        // Try to fetch existing cart
        const existingCart = await shopifyClient.getCart(savedCartId)

        if (existingCart) {
          setCart(existingCart)
        } else {
          // Cart doesn't exist, create new one
          await createNewCart()
        }
      } else {
        // No cart ID saved, create new cart
        await createNewCart()
      }
    } catch (error) {
      console.error('Error initializing cart:', error)
      toast.error('Failed to initialize cart')
    } finally {
      setIsLoading(false)
    }
  }

  const createNewCart = async () => {
    try {
      const newCart = await shopifyClient.createCart()
      setCart(newCart)
      localStorage.setItem(CART_ID_KEY, newCart.id)
    } catch (error) {
      console.error('Error creating cart:', error)
      throw error
    }
  }

  const addToCart = async (variantId: string, quantity: number = 1) => {
    try {
      setIsLoading(true)

      // Ensure we have a cart
      let currentCartId = cart?.id

      if (!currentCartId) {
        await createNewCart()
        currentCartId = cart?.id
      }

      if (!currentCartId) {
        throw new Error('Failed to create cart')
      }

      // Add item to cart
      const updatedCart = await shopifyClient.addToCart(currentCartId, variantId, quantity)
      setCart(updatedCart)

      toast.success('Added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (lineId: string) => {
    if (!cart?.id) return

    try {
      setIsLoading(true)

      const updatedCart = await shopifyClient.removeFromCart(cart.id, lineId)
      setCart(updatedCart)

      toast.success('Removed from cart')
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove item from cart')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart?.id) return

    try {
      setIsLoading(true)

      if (quantity <= 0) {
        await removeFromCart(lineId)
        return
      }

      const updatedCart = await shopifyClient.updateCartLine(cart.id, lineId, quantity)
      setCart(updatedCart)
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setIsLoading(true)

      // Create a new cart (effectively clearing the old one)
      await createNewCart()

      toast.success('Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshCart = async () => {
    if (!cart?.id) return

    try {
      const updatedCart = await shopifyClient.getCart(cart.id)
      if (updatedCart) {
        setCart(updatedCart)
      }
    } catch (error) {
      console.error('Error refreshing cart:', error)
    }
  }

  const itemCount = cart?.itemCount || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
