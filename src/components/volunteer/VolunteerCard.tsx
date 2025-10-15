'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  OpportunityWithAvailability,
  VOLUNTEER_CAMPUS_CONFIG,
  VolunteerCampus,
} from '@/types/volunteer.types';

interface VolunteerCardProps {
  opportunity: OpportunityWithAvailability;
  className?: string;
  priority?: boolean;
  onSignUp?: (opportunity: OpportunityWithAvailability) => void;
}

export function VolunteerCard({
  opportunity,
  className,
  priority = false,
  onSignUp,
}: VolunteerCardProps) {
  const campusConfig = VOLUNTEER_CAMPUS_CONFIG[opportunity.campus as VolunteerCampus];
  const opportunityDate = new Date(opportunity.date);

  // Calculate available spots
  const availableSpots = opportunity.max_volunteers - opportunity.current_signups;
  const isFull = availableSpots <= 0;
  const isAlmostFull = availableSpots > 0 && availableSpots <= 3;

  // Format time range
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeRange = `${formatTime(opportunity.start_time)} - ${formatTime(opportunity.end_time)}`;

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSignUp && !isFull) {
      onSignUp(opportunity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn('h-full', className)}
    >
      <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <CardHeader className="space-y-3">
          {/* Campus Badge */}
          <div className="flex items-start justify-between gap-2">
            <Badge
              className={cn(
                'font-semibold',
                campusConfig.bgColor,
                campusConfig.textColor,
                'border-none'
              )}
            >
              {campusConfig.label}
            </Badge>

            {/* Requirements Badge */}
            {opportunity.requirements && (
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1"
                aria-label="Special requirements"
              >
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                Requirements
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold leading-tight tracking-tight line-clamp-2">
            {opportunity.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {opportunity.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 pt-2">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <time dateTime={opportunityDate.toISOString()}>
                {format(opportunityDate, 'EEEE, MMMM d, yyyy')}
              </time>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <span>{timeRange}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{opportunity.location}</span>
            </div>

            {/* Available Spots */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <span
                className={cn(
                  'font-medium',
                  isFull && 'text-destructive',
                  isAlmostFull && 'text-amber-600'
                )}
              >
                {isFull
                  ? 'Fully Booked'
                  : `${availableSpots} of ${opportunity.max_volunteers} spots available`}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            onClick={handleSignUpClick}
            disabled={isFull}
            className={cn(
              'w-full font-semibold transition-all',
              isFull && 'cursor-not-allowed opacity-50'
            )}
            aria-label={isFull ? 'Opportunity is full' : `Sign up for ${opportunity.title}`}
          >
            {isFull ? 'Fully Booked' : 'Sign Up to Volunteer'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Export a skeleton loading state for better UX
export function VolunteerCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-full bg-muted animate-pulse rounded" />
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
