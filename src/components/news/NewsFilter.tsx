'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Campus, CAMPUS_CONFIG } from '@/types/news.types';

interface NewsFilterProps {
  selectedCampus: Campus | null;
  onCampusChange: (campus: Campus | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export function NewsFilter({
  selectedCampus,
  onCampusChange,
  searchQuery,
  onSearchChange,
  className,
}: NewsFilterProps) {
  const campuses: (Campus | null)[] = [null, 'all', 'preschool', 'elementary', 'middle-high'];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search news posts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-lg border border-input',
            'bg-background text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'transition-shadow'
          )}
          aria-label="Search news posts"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Campus Filter Badges */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3" id="campus-filter-label">
          Filter by Campus
        </h2>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-labelledby="campus-filter-label"
        >
          {campuses.map((campus) => {
            const isSelected = selectedCampus === campus;
            const config = campus ? CAMPUS_CONFIG[campus] : null;

            return (
              <Badge
                key={campus || 'all-posts'}
                className={cn(
                  'cursor-pointer transition-all text-sm font-semibold px-4 py-2',
                  'hover:scale-105 active:scale-95',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isSelected
                    ? config
                      ? `${config.bgColor} ${config.textColor} border-2 border-current`
                      : 'bg-primary text-primary-foreground border-2 border-current'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                )}
                role="button"
                tabIndex={0}
                onClick={() => onCampusChange(campus)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCampusChange(campus);
                  }
                }}
                aria-pressed={isSelected}
              >
                {campus === null ? 'All Posts' : config?.label || campus}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedCampus !== null || searchQuery) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {selectedCampus !== null && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => onCampusChange(null)}
            >
              {CAMPUS_CONFIG[selectedCampus]?.label || selectedCampus}
              <X className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Remove campus filter</span>
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => onSearchChange('')}
            >
              &quot;{searchQuery}&quot;
              <X className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Clear search</span>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCampusChange(null);
              onSearchChange('');
            }}
            className="ml-auto text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

// Example usage component showing how to integrate with state
export function NewsFilterExample() {
  const [selectedCampus, setSelectedCampus] = React.useState<Campus | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <NewsFilter
      selectedCampus={selectedCampus}
      onCampusChange={setSelectedCampus}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  );
}
