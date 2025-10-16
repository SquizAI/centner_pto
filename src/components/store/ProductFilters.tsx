'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductFilters as Filters, SortOption } from '@/lib/shopify/types'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProductFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  categories: string[]
  tags: string[]
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  categories,
  tags,
}: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: searchInput })
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    })
  }

  const handleInStockChange = (checked: boolean) => {
    onFiltersChange({ ...filters, inStock: checked ? true : undefined })
  }

  const handlePriceRangeChange = (min: string, max: string) => {
    const minNum = parseFloat(min) || undefined
    const maxNum = parseFloat(max) || undefined

    if (minNum || maxNum) {
      onFiltersChange({
        ...filters,
        priceRange: {
          min: minNum || 0,
          max: maxNum || 999999,
        },
      })
    } else {
      onFiltersChange({ ...filters, priceRange: undefined })
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    onFiltersChange({})
  }

  const activeFilterCount = [
    filters.category,
    filters.inStock,
    filters.priceRange,
    filters.search,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Sort */}
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="title-asc">Name: A-Z</SelectItem>
              <SelectItem value="title-desc">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* Toggle Filters Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <Label className="mb-3 block font-semibold">Category</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.category === category}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <Label className="mb-3 block font-semibold">Price Range</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  min="0"
                  step="0.01"
                  defaultValue={filters.priceRange?.min}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      e.target.value,
                      filters.priceRange?.max?.toString() || ''
                    )
                  }
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min="0"
                  step="0.01"
                  defaultValue={filters.priceRange?.max}
                  onChange={(e) =>
                    handlePriceRangeChange(
                      filters.priceRange?.min?.toString() || '',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <Label className="mb-3 block font-semibold">Availability</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock || false}
                  onCheckedChange={handleInStockChange}
                />
                <label htmlFor="in-stock" className="text-sm cursor-pointer">
                  In Stock Only
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
