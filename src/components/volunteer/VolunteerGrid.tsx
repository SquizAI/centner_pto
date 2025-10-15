'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import { VolunteerCard, VolunteerCardSkeleton } from './VolunteerCard';
import { cn } from '@/lib/utils';
import { OpportunityWithAvailability } from '@/types/volunteer.types';

interface VolunteerGridProps {
  opportunities: OpportunityWithAvailability[];
  className?: string;
  columns?: 1 | 2 | 3;
  onSignUp?: (opportunity: OpportunityWithAvailability) => void;
}

export function VolunteerGrid({
  opportunities,
  className,
  columns = 3,
  onSignUp,
}: VolunteerGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns];

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No volunteer opportunities available at this time.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back soon for new opportunities to get involved!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('grid gap-6', gridClass, className)}
    >
      {opportunities.map((opportunity, index) => (
        <motion.div
          key={opportunity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1, // Stagger effect
          }}
        >
          <VolunteerCard
            opportunity={opportunity}
            onSignUp={onSignUp}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Loading skeleton for volunteer grid
interface VolunteerGridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function VolunteerGridSkeleton({
  count = 6,
  columns = 3,
  className,
}: VolunteerGridSkeletonProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns];

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {[...Array(count)].map((_, index) => (
        <VolunteerCardSkeleton key={index} />
      ))}
    </div>
  );
}
