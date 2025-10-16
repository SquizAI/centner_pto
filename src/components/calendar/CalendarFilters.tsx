'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  CalendarFilters as CalendarFiltersType,
  EventType,
  EventCampus,
  EVENT_TYPE_CONFIG,
  EVENT_CAMPUS_CONFIG,
} from '@/types/calendar.types';

interface CalendarFiltersProps {
  filters: CalendarFiltersType;
  onFiltersChange: (filters: CalendarFiltersType) => void;
  className?: string;
  showMyEvents?: boolean;
}

const EVENT_TYPES: EventType[] = [
  'fundraiser',
  'volunteer',
  'social',
  'meeting',
  'educational',
  'community',
  'sports',
  'arts',
  'other',
];

const CAMPUSES: EventCampus[] = ['all', 'preschool', 'elementary', 'middle_high'];

export function CalendarFilters({
  filters,
  onFiltersChange,
  className,
  showMyEvents = true,
}: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Toggle campus filter
  const toggleCampus = (campus: EventCampus) => {
    const newCampuses = filters.campus.includes(campus)
      ? filters.campus.filter((c) => c !== campus)
      : [...filters.campus, campus];

    onFiltersChange({
      ...filters,
      campus: newCampuses,
    });
  };

  // Toggle event type filter
  const toggleEventType = (type: EventType) => {
    const newTypes = filters.eventType.includes(type)
      ? filters.eventType.filter((t) => t !== type)
      : [...filters.eventType, type];

    onFiltersChange({
      ...filters,
      eventType: newTypes,
    });
  };

  // Toggle my events filter
  const toggleMyEvents = () => {
    onFiltersChange({
      ...filters,
      myEvents: !filters.myEvents,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    onFiltersChange({
      campus: [],
      eventType: [],
      myEvents: false,
    });
  };

  // Count active filters
  const activeFilterCount =
    filters.campus.length +
    filters.eventType.length +
    (filters.myEvents ? 1 : 0);

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center gap-3', className)}>
      {/* Quick Filters - Desktop */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap">
        {/* My Events Toggle */}
        {showMyEvents && (
          <Button
            variant={filters.myEvents ? 'default' : 'outline'}
            size="sm"
            onClick={toggleMyEvents}
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            My Events
          </Button>
        )}

        {/* Campus Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Campus
              {filters.campus.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {filters.campus.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Campus</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              {CAMPUSES.map((campus) => {
                const config = EVENT_CAMPUS_CONFIG[campus];
                return (
                  <div key={campus} className="flex items-center space-x-2">
                    <Checkbox
                      id={`campus-${campus}`}
                      checked={filters.campus.includes(campus)}
                      onCheckedChange={() => toggleCampus(campus)}
                    />
                    <Label
                      htmlFor={`campus-${campus}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {config.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Event Type Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Event Type
              {filters.eventType.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {filters.eventType.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Event Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2 max-h-72 overflow-y-auto">
              {EVENT_TYPES.map((type) => {
                const config = EVENT_TYPE_CONFIG[type];
                return (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.eventType.includes(type)}
                      onCheckedChange={() => toggleEventType(type)}
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      <span className={cn('font-medium', config.textColor)}>
                        {config.label}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden w-full sm:w-auto">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Filter Events</span>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
              {/* My Events */}
              {showMyEvents && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">My Events</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="my-events-mobile"
                      checked={filters.myEvents}
                      onCheckedChange={toggleMyEvents}
                    />
                    <Label
                      htmlFor="my-events-mobile"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Show only my events
                    </Label>
                  </div>
                </div>
              )}

              {/* Campus Filters */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Campus</h4>
                <div className="space-y-2">
                  {CAMPUSES.map((campus) => {
                    const config = EVENT_CAMPUS_CONFIG[campus];
                    return (
                      <div key={campus} className="flex items-center space-x-2">
                        <Checkbox
                          id={`campus-mobile-${campus}`}
                          checked={filters.campus.includes(campus)}
                          onCheckedChange={() => toggleCampus(campus)}
                        />
                        <Label
                          htmlFor={`campus-mobile-${campus}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {config.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Type Filters */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Event Type</h4>
                <div className="space-y-2">
                  {EVENT_TYPES.map((type) => {
                    const config = EVENT_TYPE_CONFIG[type];
                    return (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-mobile-${type}`}
                          checked={filters.eventType.includes(type)}
                          onCheckedChange={() => toggleEventType(type)}
                        />
                        <Label
                          htmlFor={`type-mobile-${type}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <span className={cn('font-medium', config.textColor)}>
                            {config.label}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* Active Filter Badges - Desktop */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap flex-1">
        <AnimatePresence>
          {filters.myEvents && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Badge variant="secondary" className="gap-1">
                My Events
                <button
                  onClick={toggleMyEvents}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  aria-label="Remove my events filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          )}

          {filters.campus.map((campus) => {
            const config = EVENT_CAMPUS_CONFIG[campus];
            return (
              <motion.div
                key={campus}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge variant="outline" className={cn('gap-1', config.textColor)}>
                  {config.label}
                  <button
                    onClick={() => toggleCampus(campus)}
                    className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                    aria-label={`Remove ${config.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            );
          })}

          {filters.eventType.map((type) => {
            const config = EVENT_TYPE_CONFIG[type];
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge variant="outline" className={cn('gap-1', config.textColor)}>
                  {config.label}
                  <button
                    onClick={() => toggleEventType(type)}
                    className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                    aria-label={`Remove ${config.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
