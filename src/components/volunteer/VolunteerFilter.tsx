'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  VolunteerCampus,
  VOLUNTEER_CAMPUS_CONFIG,
  DateFilter,
  VolunteerFilters,
} from '@/types/volunteer.types';

interface VolunteerFilterProps {
  filters: VolunteerFilters;
  onFilterChange: (filters: VolunteerFilters) => void;
  className?: string;
}

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'all', label: 'All Dates' },
];

export function VolunteerFilter({
  filters,
  onFilterChange,
  className,
}: VolunteerFilterProps) {
  const campuses: (VolunteerCampus | null)[] = [
    null,
    'all',
    'preschool',
    'elementary',
    'middle-high',
  ];

  const handleCampusChange = (campus: VolunteerCampus | null) => {
    onFilterChange({ ...filters, campus });
  };

  const handleDateRangeChange = (dateRange: DateFilter) => {
    onFilterChange({ ...filters, dateRange });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Campus Filter */}
      <div>
        <h2
          className="text-sm font-semibold text-foreground mb-3"
          id="campus-filter-label"
        >
          Filter by Campus
        </h2>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-labelledby="campus-filter-label"
        >
          {campuses.map((campus) => {
            const isSelected = filters.campus === campus;
            const config = campus ? VOLUNTEER_CAMPUS_CONFIG[campus] : null;

            return (
              <Badge
                key={campus || 'all-campuses'}
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
                onClick={() => handleCampusChange(campus)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCampusChange(campus);
                  }
                }}
                aria-pressed={isSelected}
              >
                {campus === null
                  ? 'All Campuses'
                  : config?.label || campus}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <h2
          className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"
          id="date-filter-label"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" />
          Filter by Date
        </h2>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-labelledby="date-filter-label"
        >
          {DATE_FILTER_OPTIONS.map((option) => {
            const isSelected = filters.dateRange === option.value;

            return (
              <Badge
                key={option.value}
                className={cn(
                  'cursor-pointer transition-all text-sm font-semibold px-4 py-2',
                  'hover:scale-105 active:scale-95',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-2 border-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                )}
                role="button"
                tabIndex={0}
                onClick={() => handleDateRangeChange(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDateRangeChange(option.value);
                  }
                }}
                aria-pressed={isSelected}
              >
                {option.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.campus !== null || filters.dateRange !== 'upcoming') && (
        <div className="flex flex-wrap items-center gap-2 text-sm pt-2 border-t border-border">
          <span className="text-muted-foreground font-medium">Active filters:</span>
          {filters.campus !== null && (
            <Badge variant="secondary" className="text-xs">
              {VOLUNTEER_CAMPUS_CONFIG[filters.campus]?.label || 'All Campuses'}
            </Badge>
          )}
          {filters.dateRange !== 'upcoming' && (
            <Badge variant="secondary" className="text-xs">
              {DATE_FILTER_OPTIONS.find((opt) => opt.value === filters.dateRange)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
