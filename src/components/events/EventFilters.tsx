'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Filter } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export interface EventFiltersState {
  campus: string
  eventType: string
  month: string
}

interface EventFiltersProps {
  filters: EventFiltersState
  onFiltersChange: (filters: EventFiltersState) => void
}

const campusOptions = [
  { value: 'all', label: 'All Campuses' },
  { value: 'preschool', label: 'Preschool' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'middle-high', label: 'Middle/High School' },
]

const eventTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'student-event', label: 'Student Event' },
  { value: 'volunteer', label: 'Volunteer Opportunity' },
  { value: 'social', label: 'Social Event' },
]

const monthOptions = [
  { value: 'all', label: 'All Months' },
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
]

export default function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const [open, setOpen] = useState(false)

  const hasActiveFilters =
    filters.campus !== 'all' || filters.eventType !== 'all' || filters.month !== 'all'

  const clearFilters = () => {
    onFiltersChange({
      campus: 'all',
      eventType: 'all',
      month: 'all',
    })
  }

  const activeFilterCount = [
    filters.campus !== 'all',
    filters.eventType !== 'all',
    filters.month !== 'all',
  ].filter(Boolean).length

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Campus Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Campus</label>
        <Select
          value={filters.campus}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, campus: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select campus" />
          </SelectTrigger>
          <SelectContent>
            {campusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Event Type Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Event Type</label>
        <Select
          value={filters.eventType}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, eventType: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Month Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Month</label>
        <Select
          value={filters.month}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, month: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto p-0 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.campus !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {campusOptions.find((o) => o.value === filters.campus)?.label}
                <button
                  onClick={() =>
                    onFiltersChange({ ...filters, campus: 'all' })
                  }
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.eventType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {eventTypeOptions.find((o) => o.value === filters.eventType)?.label}
                <button
                  onClick={() =>
                    onFiltersChange({ ...filters, eventType: 'all' })
                  }
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.month !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {monthOptions.find((o) => o.value === filters.month)?.label}
                <button
                  onClick={() =>
                    onFiltersChange({ ...filters, month: 'all' })
                  }
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filter Events</SheetTitle>
              <SheetDescription>
                Narrow down events by campus, type, or month
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
