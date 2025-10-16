// Shopify GraphQL Types

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  images: {
    edges: Array<{
      node: {
        id: string
        url: string
        altText: string | null
        width: number
        height: number
      }
    }>
  }
  variants: {
    edges: Array<{
      node: ShopifyVariant
    }>
  }
  tags: string[]
  availableForSale: boolean
  productType: string
  vendor: string
  collections: {
    edges: Array<{
      node: {
        id: string
        title: string
        handle: string
      }
    }>
  }
}

export interface ShopifyVariant {
  id: string
  title: string
  price: {
    amount: string
    currencyCode: string
  }
  compareAtPrice: {
    amount: string
    currencyCode: string
  } | null
  availableForSale: boolean
  quantityAvailable: number
  selectedOptions: Array<{
    name: string
    value: string
  }>
  image: {
    id: string
    url: string
    altText: string | null
    width: number
    height: number
  } | null
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  lines: {
    edges: Array<{
      node: ShopifyCartLine
    }>
  }
  cost: {
    subtotalAmount: {
      amount: string
      currencyCode: string
    }
    totalAmount: {
      amount: string
      currencyCode: string
    }
    totalTaxAmount: {
      amount: string
      currencyCode: string
    } | null
  }
  estimatedCost: {
    totalAmount: {
      amount: string
      currencyCode: string
    }
  }
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: {
      id: string
      title: string
      handle: string
      images: {
        edges: Array<{
          node: {
            url: string
            altText: string | null
          }
        }>
      }
    }
    selectedOptions: Array<{
      name: string
      value: string
    }>
    price: {
      amount: string
      currencyCode: string
    }
  }
  cost: {
    totalAmount: {
      amount: string
      currencyCode: string
    }
  }
}

export interface ShopifyCollection {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  image: {
    id: string
    url: string
    altText: string | null
    width: number
    height: number
  } | null
  products: {
    edges: Array<{
      node: ShopifyProduct
    }>
  }
}

// Simplified types for UI
export interface Product {
  id: string
  title: string
  handle: string
  description: string
  price: string
  compareAtPrice?: string
  image: string
  images: string[]
  availableForSale: boolean
  productType: string
  vendor: string
  tags: string[]
  variants: ProductVariant[]
  collections: Array<{
    id: string
    title: string
    handle: string
  }>
}

export interface ProductVariant {
  id: string
  title: string
  price: string
  compareAtPrice?: string
  availableForSale: boolean
  quantityAvailable: number
  options: Array<{
    name: string
    value: string
  }>
  image?: string
}

export interface CartItem {
  id: string
  variantId: string
  productId: string
  productTitle: string
  productHandle: string
  variantTitle: string
  quantity: number
  price: string
  image: string
  options: Array<{
    name: string
    value: string
  }>
  subtotal: string
}

export interface Cart {
  id: string
  checkoutUrl: string
  items: CartItem[]
  itemCount: number
  subtotal: string
  total: string
}

// Filter and Sort Options
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc'

export interface ProductFilters {
  category?: string
  priceRange?: {
    min: number
    max: number
  }
  sizes?: string[]
  colors?: string[]
  tags?: string[]
  inStock?: boolean
  search?: string
}
