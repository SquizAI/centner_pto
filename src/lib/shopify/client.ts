import { ShopifyProduct, ShopifyCart, ShopifyCollection, Product, Cart, CartItem } from './types'

// GraphQL Queries
const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    availableForSale
    productType
    vendor
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    collections(first: 10) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    estimatedCost {
      totalAmount {
        amount
        currencyCode
      }
    }
  }
`

class ShopifyClient {
  private domain: string
  private storefrontAccessToken: string
  private apiVersion: string = '2024-10'

  constructor() {
    this.domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || ''
    this.storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || ''

    if (!this.domain || !this.storefrontAccessToken) {
      console.warn('Shopify credentials not configured. Store features will not work.')
    }
  }

  // Check if Shopify is configured
  isConfigured(): boolean {
    return !!(this.domain && this.storefrontAccessToken)
  }

  private async graphqlRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    if (!this.domain || !this.storefrontAccessToken) {
      throw new Error('Shopify client not configured. Please set environment variables.')
    }

    const url = `https://${this.domain}/api/${this.apiVersion}/graphql.json`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`)
    }

    const json = await response.json()

    if (json.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
    }

    return json.data
  }

  // Get all products with pagination
  async getAllProducts(first: number = 20, after?: string): Promise<{ products: Product[]; hasNextPage: boolean; endCursor: string | null }> {
    const query = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              ...ProductFragment
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
      ${PRODUCT_FRAGMENT}
    `

    const data = await this.graphqlRequest<any>(query, { first, after })

    return {
      products: data.products.edges.map((edge: any) => this.normalizeProduct(edge.node)),
      hasNextPage: data.products.pageInfo.hasNextPage,
      endCursor: data.products.pageInfo.endCursor,
    }
  }

  // Get a single product by handle
  async getProductByHandle(handle: string): Promise<Product | null> {
    const query = `
      query GetProductByHandle($handle: String!) {
        product(handle: $handle) {
          ...ProductFragment
        }
      }
      ${PRODUCT_FRAGMENT}
    `

    const data = await this.graphqlRequest<any>(query, { handle })

    return data.product ? this.normalizeProduct(data.product) : null
  }

  // Get a single product by ID
  async getProductById(id: string): Promise<Product | null> {
    const query = `
      query GetProductById($id: ID!) {
        product(id: $id) {
          ...ProductFragment
        }
      }
      ${PRODUCT_FRAGMENT}
    `

    const data = await this.graphqlRequest<any>(query, { id })

    return data.product ? this.normalizeProduct(data.product) : null
  }

  // Get products by collection
  async getProductsByCollection(collectionHandle: string, first: number = 20): Promise<Product[]> {
    const query = `
      query GetProductsByCollection($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) {
            edges {
              node {
                ...ProductFragment
              }
            }
          }
        }
      }
      ${PRODUCT_FRAGMENT}
    `

    const data = await this.graphqlRequest<any>(query, { handle: collectionHandle, first })

    if (!data.collection) return []

    return data.collection.products.edges.map((edge: any) => this.normalizeProduct(edge.node))
  }

  // Get all collections
  async getAllCollections(first: number = 20): Promise<Array<{ id: string; title: string; handle: string; description: string }>> {
    const query = `
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
            }
          }
        }
      }
    `

    const data = await this.graphqlRequest<any>(query, { first })

    return data.collections.edges.map((edge: any) => edge.node)
  }

  // Search products
  async searchProducts(searchTerm: string, first: number = 20): Promise<Product[]> {
    const query = `
      query SearchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              ...ProductFragment
            }
          }
        }
      }
      ${PRODUCT_FRAGMENT}
    `

    const data = await this.graphqlRequest<any>(query, { query: searchTerm, first })

    return data.products.edges.map((edge: any) => this.normalizeProduct(edge.node))
  }

  // Create a new cart
  async createCart(): Promise<Cart> {
    const query = `
      mutation CreateCart {
        cartCreate {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `

    const data = await this.graphqlRequest<any>(query)

    if (data.cartCreate.userErrors?.length > 0) {
      throw new Error(data.cartCreate.userErrors[0].message)
    }

    return this.normalizeCart(data.cartCreate.cart)
  }

  // Get cart by ID
  async getCart(cartId: string): Promise<Cart | null> {
    const query = `
      query GetCart($id: ID!) {
        cart(id: $id) {
          ...CartFragment
        }
      }
      ${CART_FRAGMENT}
    `

    try {
      const data = await this.graphqlRequest<any>(query, { id: cartId })
      return data.cart ? this.normalizeCart(data.cart) : null
    } catch (error) {
      console.error('Error fetching cart:', error)
      return null
    }
  }

  // Add items to cart
  async addToCart(cartId: string, variantId: string, quantity: number = 1): Promise<Cart> {
    const query = `
      mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `

    const lines = [{
      merchandiseId: variantId,
      quantity,
    }]

    const data = await this.graphqlRequest<any>(query, { cartId, lines })

    if (data.cartLinesAdd.userErrors?.length > 0) {
      throw new Error(data.cartLinesAdd.userErrors[0].message)
    }

    return this.normalizeCart(data.cartLinesAdd.cart)
  }

  // Update cart line quantity
  async updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
    const query = `
      mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `

    const lines = [{
      id: lineId,
      quantity,
    }]

    const data = await this.graphqlRequest<any>(query, { cartId, lines })

    if (data.cartLinesUpdate.userErrors?.length > 0) {
      throw new Error(data.cartLinesUpdate.userErrors[0].message)
    }

    return this.normalizeCart(data.cartLinesUpdate.cart)
  }

  // Remove cart line
  async removeFromCart(cartId: string, lineId: string): Promise<Cart> {
    const query = `
      mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFragment
          }
          userErrors {
            field
            message
          }
        }
      }
      ${CART_FRAGMENT}
    `

    const data = await this.graphqlRequest<any>(query, { cartId, lineIds: [lineId] })

    if (data.cartLinesRemove.userErrors?.length > 0) {
      throw new Error(data.cartLinesRemove.userErrors[0].message)
    }

    return this.normalizeCart(data.cartLinesRemove.cart)
  }

  // Helper: Normalize Shopify product to simplified format
  private normalizeProduct(product: ShopifyProduct): Product {
    const firstVariant = product.variants.edges[0]?.node
    const images = product.images.edges.map(edge => edge.node.url)

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      price: firstVariant?.price.amount || '0',
      compareAtPrice: firstVariant?.compareAtPrice?.amount,
      image: images[0] || '/placeholder-product.png',
      images,
      availableForSale: product.availableForSale,
      productType: product.productType,
      vendor: product.vendor,
      tags: product.tags,
      variants: product.variants.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        price: edge.node.price.amount,
        compareAtPrice: edge.node.compareAtPrice?.amount,
        availableForSale: edge.node.availableForSale,
        quantityAvailable: edge.node.quantityAvailable || 0,
        options: edge.node.selectedOptions,
        image: edge.node.image?.url,
      })),
      collections: product.collections.edges.map(edge => edge.node),
    }
  }

  // Helper: Normalize Shopify cart to simplified format
  private normalizeCart(cart: ShopifyCart): Cart {
    const items: CartItem[] = cart.lines.edges.map(edge => {
      const line = edge.node
      const product = line.merchandise.product

      return {
        id: line.id,
        variantId: line.merchandise.id,
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        variantTitle: line.merchandise.title,
        quantity: line.quantity,
        price: line.merchandise.price.amount,
        image: product.images.edges[0]?.node.url || '/placeholder-product.png',
        options: line.merchandise.selectedOptions,
        subtotal: line.cost.totalAmount.amount,
      }
    })

    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.cost.subtotalAmount.amount,
      total: cart.cost.totalAmount.amount,
    }
  }
}

// Export singleton instance
export const shopifyClient = new ShopifyClient()

// Export utility functions
export function formatPrice(amount: string | number, currencyCode: string = 'USD'): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(price)
}

export function isOnSale(price: string, compareAtPrice?: string): boolean {
  if (!compareAtPrice) return false
  return parseFloat(compareAtPrice) > parseFloat(price)
}

export function getDiscountPercentage(price: string, compareAtPrice?: string): number {
  if (!compareAtPrice) return 0
  const discount = parseFloat(compareAtPrice) - parseFloat(price)
  return Math.round((discount / parseFloat(compareAtPrice)) * 100)
}
