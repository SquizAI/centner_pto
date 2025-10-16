'use client'

import { useState, useMemo } from 'react'
import { Product, ProductFilters as Filters, SortOption } from '@/lib/shopify/types'
import ProductGrid from '@/components/store/ProductGrid'
import ProductFilters from '@/components/store/ProductFilters'
import QuickViewModal from '@/components/store/QuickViewModal'

interface StoreClientProps {
  initialProducts: Product[]
  categories: string[]
  tags: string[]
}

export default function StoreClient({ initialProducts, categories, tags }: StoreClientProps) {
  const [filters, setFilters] = useState<Filters>({})
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...initialProducts]

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.productType === filters.category)
    }

    // Apply in stock filter
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.availableForSale)
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter((p) => {
        const price = parseFloat(p.price)
        const min = filters.priceRange!.min || 0
        const max = filters.priceRange!.max || Infinity
        return price >= min && price <= max
      })
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price-desc':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'newest':
      default:
        // Already sorted by creation date from API
        break
    }

    return filtered
  }, [initialProducts, filters, sortBy])

  return (
    <>
      <ProductFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        tags={tags}
      />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedProducts.length} of {initialProducts.length} products
          </p>
        </div>

        <ProductGrid
          products={filteredAndSortedProducts}
          onQuickView={setQuickViewProduct}
        />
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  )
}
