'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GalleryCampus, GALLERY_CAMPUS_CONFIG } from '@/types/gallery.types';

interface AlbumFilterProps {
  selectedCampus: GalleryCampus | null;
  onCampusChange: (campus: GalleryCampus | null) => void;
  className?: string;
}

export function AlbumFilter({
  selectedCampus,
  onCampusChange,
  className,
}: AlbumFilterProps) {
  const campuses: (GalleryCampus | null)[] = [
    null,
    'all',
    'preschool',
    'elementary',
    'middle-high',
  ];

  return (
    <div className={cn('space-y-4', className)}>
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
            const isSelected = selectedCampus === campus;
            const config = campus ? GALLERY_CAMPUS_CONFIG[campus] : null;

            return (
              <Badge
                key={campus || 'all-albums'}
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
                {campus === null ? 'All Albums' : config?.label || campus}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
